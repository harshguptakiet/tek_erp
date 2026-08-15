/**
 * CSRF Protection Guard
 * Validates CSRF token on state-changing requests (POST, PUT, PATCH, DELETE)
 */

import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SecurityService } from '../services/security.service';

// Decorator to bypass CSRF check for specific endpoints
export const BypassCSRF = () => {
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      Reflect.defineMetadata('bypass-csrf', true, descriptor.value);
    } else {
      Reflect.defineMetadata('bypass-csrf', true, target);
    }
    return descriptor || target;
  };
};

@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly logger = new Logger(CsrfGuard.name);

  constructor(
    private reflector: Reflector,
    private securityService: SecurityService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const method = request.method.toUpperCase();

    // Only check CSRF on state-changing methods
    const stateChangingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (!stateChangingMethods.includes(method)) {
      return true; // GET, HEAD, OPTIONS don't need CSRF protection
    }

    // Check if endpoint has @BypassCSRF() decorator
    const bypassCsrf = this.reflector.get<boolean>('bypass-csrf', context.getHandler()) ||
                       this.reflector.get<boolean>('bypass-csrf', context.getClass());
    
    if (bypassCsrf) {
      return true;
    }

    // Extract CSRF token from header
    const csrfToken = request.headers['x-csrf-token'] || request.headers['x-xsrf-token'];
    
    if (!csrfToken) {
      this.logger.warn(`CSRF token missing for ${method} ${request.url}`);
      throw new ForbiddenException('CSRF token is required for this request');
    }

    // Extract session ID from user context (set by JWT strategy)
    const sessionId = request.user?.sessionId;
    
    if (!sessionId) {
      // If no session ID, we can't validate CSRF (this shouldn't happen in authenticated requests)
      this.logger.warn(`No session ID found for CSRF validation on ${method} ${request.url}`);
      return true; // Let it pass, JWT validation is primary security
    }

    // Validate CSRF token
    const isValid = await this.securityService.validateCSRFToken(sessionId, csrfToken);
    
    if (!isValid) {
      this.logger.warn(`Invalid CSRF token for session ${sessionId} on ${method} ${request.url}`);
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}
