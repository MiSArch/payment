import { Logger, Module, forwardRef } from '@nestjs/common';
import { PaymentInformationService } from './payment-information.service';
import { PaymentInformationResolver } from './payment-information.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PaymentInformation,
  PaymentInformationSchema,
} from './entities/payment-information.entity';
import { PaymentModule } from 'src/payment/payment.module';
import { UserResolver } from './user.resolver';

/**
 * Module for handling payment information.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaymentInformation.name, schema: PaymentInformationSchema },
    ]),
    // To avoid circular dependencies, forwardRef() is used to import the PaymentModule
    forwardRef(() => PaymentModule),
  ],
  providers: [
    PaymentInformationResolver,
    PaymentInformationService,
    UserResolver,
    Logger,
  ],
  exports: [PaymentInformationService],
})
export class PaymentInformationModule {}
