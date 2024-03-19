import { Logger, Module } from '@nestjs/common';
import { OpenOrdersService } from './open-orders.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OpenOrder, OpenOrderSchema } from './entities/open-order.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OpenOrder.name, schema: OpenOrderSchema },
    ]),
  ],
  providers: [OpenOrdersService, Logger],
  exports: [OpenOrdersService],
})
export class OpenOrdersModule {}
