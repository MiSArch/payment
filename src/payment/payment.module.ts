import { Logger, Module, forwardRef } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentResolver } from './payment.resolver';
import { PaymentInformationModule } from 'src/payment-information/payment-information.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './entities/payment.entity';

/**
 * Module for handling payments.
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    // To avoid circular dependencies, forwardRef() is used to import the PaymentModule
    forwardRef(() => PaymentInformationModule),
  ],
  providers: [PaymentResolver, PaymentService, Logger],
  exports: [PaymentService],
})
export class PaymentModule {}
