import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { AsyncContext } from './async-context';

@Injectable()
export class TraceMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    AsyncContext.run(() => {
      const traceId = randomUUID();
      AsyncContext.set('traceId', traceId);
      req.traceId = traceId;
      next();
    });
  }
}
