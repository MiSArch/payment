import { Logger, Module } from '@nestjs/common';
import { PaymentInformationService } from './payment-information.service';
import { PaymentInformationResolver } from './payment-information.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PaymentInformation,
  PaymentInformationSchema,
} from './entities/payment-information.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaymentInformation.name, schema: PaymentInformationSchema },
    ]),
  ],
  providers: [PaymentInformationResolver, PaymentInformationService, Logger],
  exports: [PaymentInformationService],
})
export class PaymentInformationModule {}
