import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Token Blacklist Service
 * FR-AUTH-013: JWT Access Token Blacklist
 * FR-AUTH-027: Logout with token invalidation
 * 
 * Manages blacklisted JWT access tokens in Redis
 * Tokens are blacklisted when:
 * - User logs out
 * - Password is changed
 * - Admin revokes access
 * - Security event requires invalidation
 */
@Injectable()
export class TokenBlacklistService {
  private readonly logger = new Logger(TokenBlacklistService.name);
  private readonly redis: Redis;
  private readonly KEY_PREFIX = 'blacklist:token:';

  constructor(private configService: ConfigService) {
    // Initialize Redis connection
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    
    this.redis = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this.redis.on('connect', () => {
      this.logger.log('✅ Connected to Redis for token blacklist');
    });

    this.redis.on('error', (err) => {
      this.logger.error(`❌ Redis connection error: ${err.message}`);
    });
  }

  /**
   * Blacklist a token
   * @param token - JWT access token to blacklist
   * @param userId - User ID who owns the token
   * @param reason - Reason for blacklisting (LOGOUT, PASSWORD_CHANGE, ADMIN_REVOKE, etc.)
   * @param ttlSeconds - Time to live in seconds (should match token expiry)
   */
  async blacklistToken(
    token: string,
    userId: string,
    reason: string,
    ttlSeconds: number = 3600, // Default 1 hour (access token expiry)
  ): Promise<void> {
    try {
      const key = this.KEY_PREFIX + token;
      const value = JSON.stringify({
        userId,
        reason,
        blacklistedAt: new Date().toISOString(),
      });

      await this.redis.setex(key, ttlSeconds, value);

      this.logger.log(
        `Token blacklisted - User: ${userId}, Reason: ${reason}, TTL: ${ttlSeconds}s`,
      );
    } catch (error) {
      this.logger.error(`Failed to blacklist token: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if a token is blacklisted
   * @param token - JWT access token to check
   * @returns true if token is blacklisted, false otherwise
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const key = this.KEY_PREFIX + token;
      const result = await this.redis.get(key);

      if (result) {
        const data = JSON.parse(result);
        this.logger.debug(
          `Blacklisted token detected - User: ${data.userId}, Reason: ${data.reason}`,
        );
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(`Failed to check token blacklist: ${error.message}`);
      // Fail open - if Redis is down, allow the request
      // Token will still be validated via JWT signature and expiry
      return false;
    }
  }

  /**
   * Blacklist all tokens for a user
   * Used when:
   * - Password is changed
   * - Account is compromised
   * - Admin forces logout all devices
   * 
   * @param userId - User ID
   * @param reason - Reason for blacklisting all tokens
   * @param ttlSeconds - TTL for blacklist entries (default 1 hour)
   */
  async blacklistAllUserTokens(
    userId: string,
    reason: string,
    ttlSeconds: number = 3600,
  ): Promise<void> {
    try {
      // Store a flag to indicate all tokens for this user are blacklisted
      const key = `${this.KEY_PREFIX}user:${userId}:all`;
      const value = JSON.stringify({
        reason,
        blacklistedAt: new Date().toISOString(),
      });

      await this.redis.setex(key, ttlSeconds, value);

      this.logger.log(
        `All tokens blacklisted for user: ${userId}, Reason: ${reason}, TTL: ${ttlSeconds}s`,
      );
    } catch (error) {
      this.logger.error(`Failed to blacklist all user tokens: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if all tokens for a user are blacklisted
   * @param userId - User ID to check
   * @returns true if all user's tokens are blacklisted
   */
  async areAllUserTokensBlacklisted(userId: string): Promise<boolean> {
    try {
      const key = `${this.KEY_PREFIX}user:${userId}:all`;
      const result = await this.redis.get(key);

      if (result) {
        const data = JSON.parse(result);
        this.logger.debug(
          `All tokens blacklisted for user: ${userId}, Reason: ${data.reason}`,
        );
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(`Failed to check user token blacklist: ${error.message}`);
      return false;
    }
  }

  /**
   * Remove a token from blacklist (rare use case)
   * @param token - Token to remove from blacklist
   */
  async removeFromBlacklist(token: string): Promise<void> {
    try {
      const key = this.KEY_PREFIX + token;
      await this.redis.del(key);
      this.logger.log(`Token removed from blacklist`);
    } catch (error) {
      this.logger.error(`Failed to remove token from blacklist: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clear all user token blacklists (use with caution)
   * @param userId - User ID
   */
  async clearUserBlacklist(userId: string): Promise<void> {
    try {
      const key = `${this.KEY_PREFIX}user:${userId}:all`;
      await this.redis.del(key);
      this.logger.log(`Cleared blacklist for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to clear user blacklist: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get blacklist statistics
   * @returns Statistics about blacklisted tokens
   */
  async getBlacklistStats(): Promise<{
    totalBlacklistedTokens: number;
    totalBlacklistedUsers: number;
  }> {
    try {
      const tokenKeys = await this.redis.keys(`${this.KEY_PREFIX}*`);
      const userKeys = tokenKeys.filter((key) => key.includes(':user:'));

      return {
        totalBlacklistedTokens: tokenKeys.length - userKeys.length,
        totalBlacklistedUsers: userKeys.length,
      };
    } catch (error) {
      this.logger.error(`Failed to get blacklist stats: ${error.message}`);
      return {
        totalBlacklistedTokens: 0,
        totalBlacklistedUsers: 0,
      };
    }
  }

  /**
   * Cleanup expired entries (Redis does this automatically, but can be called manually)
   */
  async cleanup(): Promise<void> {
    // Redis automatically removes expired keys, no manual cleanup needed
    this.logger.log('Blacklist cleanup complete (handled by Redis TTL)');
  }

  /**
   * Gracefully close Redis connection
   */
  async onModuleDestroy() {
    await this.redis.quit();
    this.logger.log('Redis connection closed');
  }
}
