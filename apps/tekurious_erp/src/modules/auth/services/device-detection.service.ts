/**
 * Device Detection Service
 * Parses user agent and detects device information (FR-AUTH-015)
 */

import { Injectable, Logger } from '@nestjs/common';
import * as UAParser from 'ua-parser-js';
import { Request } from 'express';

export interface DeviceInfo {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  deviceVendor?: string;
  deviceModel?: string;
  raw: string;
}

export interface LocationInfo {
  ip: string;
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

@Injectable()
export class DeviceDetectionService {
  private readonly logger = new Logger(DeviceDetectionService.name);

  /**
   * Parse user agent string and extract device information
   * @param userAgent - User agent string from request header
   * @returns Parsed device information
   */
  parseUserAgent(userAgent: string): DeviceInfo {
    try {
      const parser = new UAParser(userAgent);
      const result = parser.getResult();

      return {
        browser: result.browser.name || 'Unknown',
        browserVersion: result.browser.version || 'Unknown',
        os: result.os.name || 'Unknown',
        osVersion: result.os.version || 'Unknown',
        device: this.getDeviceName(result),
        deviceType: this.getDeviceType(result),
        deviceVendor: result.device.vendor,
        deviceModel: result.device.model,
        raw: userAgent,
      };
    } catch (error) {
      this.logger.error(`Failed to parse user agent: ${error.message}`);
      return {
        browser: 'Unknown',
        browserVersion: 'Unknown',
        os: 'Unknown',
        osVersion: 'Unknown',
        device: 'Unknown',
        deviceType: 'unknown',
        raw: userAgent,
      };
    }
  }

  /**
   * Extract device information from HTTP request
   * @param req - Express request object
   * @returns Device information
   */
  getDeviceFromRequest(req: Request): DeviceInfo {
    const userAgent = req.headers['user-agent'] || 'Unknown';
    return this.parseUserAgent(userAgent);
  }

  /**
   * Get IP address from request (handles proxies)
   * @param req - Express request object
   * @returns IP address
   */
  getIpFromRequest(req: Request): string {
    // Check for forwarded IP (behind proxy/load balancer)
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
      return ips.trim();
    }

    // Check other proxy headers
    const realIp = req.headers['x-real-ip'];
    if (realIp && !Array.isArray(realIp)) {
      return realIp.trim();
    }

    // Fallback to direct connection IP
    return req.ip || req.socket.remoteAddress || 'Unknown';
  }

  /**
   * Get location information from IP address using ip-api.com (free, no API key)
   * Note: Consider upgrading to paid service for production (ipapi.co, ipstack.com)
   * @param ipAddress - IP address to lookup
   * @returns Location information
   */
  async getLocationFromIp(ipAddress: string): Promise<LocationInfo> {
    try {
      // Skip for local IPs
      if (
        ipAddress === 'Unknown' ||
        ipAddress.startsWith('127.') ||
        ipAddress.startsWith('::1') ||
        ipAddress.startsWith('192.168.') ||
        ipAddress.startsWith('10.') ||
        ipAddress.startsWith('172.')
      ) {
        return {
          ip: ipAddress,
          country: 'Local',
          city: 'Localhost',
        };
      }

      // Use ip-api.com free API (15 requests/minute limit)
      const response = await fetch(
        `http://ip-api.com/json/${ipAddress}?fields=status,message,country,regionName,city,lat,lon,timezone`,
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'fail') {
        this.logger.warn(`IP lookup failed for ${ipAddress}: ${data.message}`);
        return { ip: ipAddress };
      }

      return {
        ip: ipAddress,
        country: data.country,
        region: data.regionName,
        city: data.city,
        latitude: data.lat,
        longitude: data.lon,
        timezone: data.timezone,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get location for IP ${ipAddress}: ${error.message}`,
      );
      return { ip: ipAddress };
    }
  }

  /**
   * Get human-readable device name
   */
  private getDeviceName(result: UAParser.IResult): string {
    const { device, os, browser } = result;

    if (device.model && device.vendor) {
      return `${device.vendor} ${device.model}`;
    }

    if (device.type) {
      return `${this.capitalize(device.type)}`;
    }

    // Desktop fallback
    return `${os.name || 'Unknown'} ${browser.name || 'Browser'}`;
  }

  /**
   * Determine device type
   */
  private getDeviceType(
    result: UAParser.IResult,
  ): 'desktop' | 'mobile' | 'tablet' | 'unknown' {
    const type = result.device.type;

    if (type === 'mobile') return 'mobile';
    if (type === 'tablet') return 'tablet';
    if (type === 'wearable' || type === 'embedded') return 'mobile';

    // If no device type, it's likely desktop
    if (!type || type === 'console') return 'desktop';

    return 'unknown';
  }

  /**
   * Capitalize first letter
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Generate short device identifier for display
   * Example: "Chrome on Windows", "Safari on iPhone"
   */
  getShortDeviceId(deviceInfo: DeviceInfo): string {
    const browser = deviceInfo.browser || 'Unknown Browser';
    const os = deviceInfo.os || 'Unknown OS';
    const device = deviceInfo.deviceModel || os;

    return `${browser} on ${device}`;
  }
}
