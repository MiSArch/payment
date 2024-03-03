import { Module } from '@nestjs/common';
import { PaymentInformationService } from './payment-information.service';
import { PaymentInformationResolver } from './payment-information.resolver';

@Module({
  providers: [PaymentInformationResolver, PaymentInformationService],
})
export class PaymentInformationModule {}
