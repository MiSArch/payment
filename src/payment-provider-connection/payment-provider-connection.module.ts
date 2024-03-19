import { Module } from '@nestjs/common';
import { PaymentProviderConnectionService } from './payment-provider-connection.service';
import { PaymentProviderConnectionController } from './payment-provider-connection.controller';
import { EventModule } from 'src/events/event.module';
import { PaymentModule } from 'src/payment/payment.module';
import { CreditCardService } from './payment-processors/credit-card.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [EventModule, PaymentModule, HttpModule],
  providers: [PaymentProviderConnectionService, CreditCardService],
  controllers: [PaymentProviderConnectionController],
})
export class PaymentProviderConnectionModule {}
