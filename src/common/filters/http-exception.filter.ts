import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { ServiceMessages } from '../constants/service-messages.js';
import type { ApiResponse } from '../types/api-response.js';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = this.resolveMessage(exception, status);
    const body: ApiResponse<null> = {
      success: false,
      data: null,
      message,
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        exception instanceof Error ? exception.stack : exception,
      );
    }

    response.status(status).json(body);
  }

  private resolveMessage(exception: unknown, status: number): string {
    if (status === HttpStatus.UNAUTHORIZED) {
      return ServiceMessages.unauthorized;
    }
    if (status === HttpStatus.FORBIDDEN) {
      return ServiceMessages.forbidden;
    }
    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      return ServiceMessages.tooManyRequests;
    }

    if (exception instanceof HttpException) {
      const payload = exception.getResponse();
      if (typeof payload === 'string') {
        return payload;
      }
      if (typeof payload === 'object' && payload !== null && 'message' in payload) {
        const value = (payload as { message: string | string[] }).message;
        if (Array.isArray(value)) {
          return value[0] ?? ServiceMessages.validationFailed;
        }
        if (typeof value === 'string' && value.length > 0) {
          return value;
        }
      }
    }

    return ServiceMessages.fetchFail;
  }
}
