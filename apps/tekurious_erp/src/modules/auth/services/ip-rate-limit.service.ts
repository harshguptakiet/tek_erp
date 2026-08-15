import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * IP Rate Limit Service
 * FR-AUTH-025: Account Lockout Protection - IP-based rate limiting
 * 
 * Features:
 * - Track failed login attempts per IP address
 * - Block IPs after threshold exceeded
 * - Automatic expiry with Redis TTL
 * - Protection against distributed brute force attacks
 */
@Injectable()
export class IpRateLimitService {
  private readonly logger = new Logger(IpRateLimitService.name);
  private readonly redis: Redis;
  private readonly KEY_PREFIX = 'ip_failed_login:';
  private readonly BLOCKED_IP_PREFIX = 'ip_blocked:';

  constructor(private configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    
    this.redis = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this.redis.on('connect', () => {
      this.logger.log('✅ Connected to Redis for IP rate limiting');
    });

    this.redis.on('error', (err) => {
      this.logger.error(`❌ Redis connection error: ${err.message}`);
    });
  }

  /**
   * Record a failed login attempt from an IP
   * @param ipAddress - IP address
   * @param ttlSeconds - Time window for counting attempts (default 15 minutes)
   * @returns Current failed attempt count
   */
  async recordFailedAttempt(ipAddress: string, ttlSeconds: number = 900): Promise<number> {
    try {
      const key = this.KEY_PREFIX + ipAddress;
      
      // Increment counter
      const attempts = await this.redis.incr(key);
      
      // Set expiry if this is the first attempt
      if (attempts === 1) {
        await this.redis.expire(key, ttlSeconds);
      }

      this.logger.debug(`Failed login attempt ${attempts} from IP: ${ipAddress}`);

      // Check if threshold exceeded (10 failed attempts)
      if (attempts >= 10) {
        await this.blockIp(ipAddress, 3600); // Block for 1 hour
        this.logger.warn(`🚫 IP blocked due to excessive failures: ${ipAddress}`);
      }

      return attempts;
    } catch (error) {
      this.logger.error(`Failed to record failed attempt: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get failed attempt count for an IP
   * @param ipAddress - IP address
   * @returns Number of failed attempts
   */
  async getFailedAttempts(ipAddress: string): Promise<number> {
    try {
      const key = this.KEY_PREFIX + ipAddress;
      const attempts = await this.redis.get(key);
      return attempts ? parseInt(attempts, 10) : 0;
    } catch (error) {
      this.logger.error(`Failed to get failed attempts: ${error.message}`);
      return 0;
    }
  }

  /**
   * Reset failed attempts for an IP
   * @param ipAddress - IP address
   */
  async resetFailedAttempts(ipAddress: string): Promise<void> {
    try {
      const key = this.KEY_PREFIX + ipAddress;
      await this.redis.del(key);
      this.logger.debug(`Reset failed attempts for IP: ${ipAddress}`);
    } catch (error) {
      this.logger.error(`Failed to reset failed attempts: ${error.message}`);
    }
  }

  /**
   * Block an IP address
   * @param ipAddress - IP to block
   * @param ttlSeconds - Duration of block in seconds (default 1 hour)
   */
  async blockIp(ipAddress: string, ttlSeconds: number = 3600): Promise<void> {
    try {
      const key = this.BLOCKED_IP_PREFIX + ipAddress;
      const blockData = JSON.stringify({
        blockedAt: new Date().toISOString(),
        reason: 'EXCESSIVE_FAILED_ATTEMPTS',
        expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
      });

      await this.redis.setex(key, ttlSeconds, blockData);

      this.logger.warn(`IP blocked: ${ipAddress} for ${ttlSeconds} seconds`);
    } catch (error) {
      this.logger.error(`Failed to block IP: ${error.message}`);
    }
  }

  /**
   * Check if an IP is blocked
   * @param ipAddress - IP to check
   * @returns true if blocked, false otherwise
   */
  async isIpBlocked(ipAddress: string): Promise<boolean> {
    try {
      const key = this.BLOCKED_IP_PREFIX + ipAddress;
      const result = await this.redis.get(key);

      if (result) {
        const blockData = JSON.parse(result);
        this.logger.debug(`IP ${ipAddress} is blocked until ${blockData.expiresAt}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(`Failed to check IP block status: ${error.message}`);
      return false; // Fail open
    }
  }

  /**
   * Unblock an IP address (admin action)
   * @param ipAddress - IP to unblock
   */
  async unblockIp(ipAddress: string): Promise<void> {
    try {
      const key = this.BLOCKED_IP_PREFIX + ipAddress;
      await this.redis.del(key);

      // Also reset failed attempts
      await this.resetFailedAttempts(ipAddress);

      this.logger.log(`IP unblocked by admin: ${ipAddress}`);
    } catch (error) {
      this.logger.error(`Failed to unblock IP: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get time remaining for IP block
   * @param ipAddress - IP address
   * @returns Seconds remaining in block, or 0 if not blocked
   */
  async getBlockTimeRemaining(ipAddress: string): Promise<number> {
    try {
      const key = this.BLOCKED_IP_PREFIX + ipAddress;
      const ttl = await this.redis.ttl(key);
      return ttl > 0 ? ttl : 0;
    } catch (error) {
      this.logger.error(`Failed to get block time remaining: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get list of currently blocked IPs
   * @returns Array of blocked IP addresses
   */
  async getBlockedIps(): Promise<Array<{ ip: string; expiresIn: number }>> {
    try {
      const keys = await this.redis.keys(`${this.BLOCKED_IP_PREFIX}*`);
      const blockedIps = [];

      for (const key of keys) {
        const ip = key.replace(this.BLOCKED_IP_PREFIX, '');
        const ttl = await this.redis.ttl(key);
        
        if (ttl > 0) {
          blockedIps.push({ ip, expiresIn: ttl });
        }
      }

      return blockedIps;
    } catch (error) {
      this.logger.error(`Failed to get blocked IPs: ${error.message}`);
      return [];
    }
  }

  /**
   * Get statistics about IP rate limiting
   * @returns Statistics object
   */
  async getStats(): Promise<{
    totalBlockedIps: number;
    ipsWithFailedAttempts: number;
  }> {
    try {
      const blockedKeys = await this.redis.keys(`${this.BLOCKED_IP_PREFIX}*`);
      const failedKeys = await this.redis.keys(`${this.KEY_PREFIX}*`);

      return {
        totalBlockedIps: blockedKeys.length,
        ipsWithFailedAttempts: failedKeys.length,
      };
    } catch (error) {
      this.logger.error(`Failed to get IP rate limit stats: ${error.message}`);
      return {
        totalBlockedIps: 0,
        ipsWithFailedAttempts: 0,
      };
    }
  }

  /**
   * Cleanup expired entries (Redis does this automatically)
   */
  async cleanup(): Promise<void> {
    this.logger.log('IP rate limit cleanup complete (handled by Redis TTL)');
  }

  /**
   * Gracefully close Redis connection
   */
  async onModuleDestroy() {
    await this.redis.quit();
    this.logger.log('Redis connection closed (IP rate limit)');
  }
}
