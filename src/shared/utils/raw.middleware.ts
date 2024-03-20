import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    if (req.headers['content-type'] === 'application/cloudevents+json') {
      console.log('RawBodyMiddleware: Received Dapr Event')
      console.log(req.headers)
      console.log(req.body)
      console.log(typeof req.body)
    }
    next();
  }
}