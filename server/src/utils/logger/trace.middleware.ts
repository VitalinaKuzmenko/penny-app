import { Injectable, NestMiddleware } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AsyncContext } from './async-context';

@Injectable()
export class TraceMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    AsyncContext.run(() => {
      const traceId = uuidv4();
      AsyncContext.set('traceId', traceId);
      req.traceId = traceId;
      next();
    });
  }
}
