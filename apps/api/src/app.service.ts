import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  health() {
    return {
      status: 'ok',
      service: 'academia-api',
      timestamp: new Date().toISOString(),
    };
  }
}
