import { Logger, Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentResolver } from './payment.resolver';
import { PaymentInformationModule } from 'src/payment-information/payment-information.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './entities/payment.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    PaymentInformationModule,
  ],
  providers: [PaymentResolver, PaymentService, Logger],
  exports: [PaymentService],
})
export class PaymentModule {}
