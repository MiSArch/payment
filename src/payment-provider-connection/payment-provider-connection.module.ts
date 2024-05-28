import { Logger, Module, forwardRef } from '@nestjs/common';
import { PaymentProviderConnectionService } from './payment-provider-connection.service';
import { PaymentProviderConnectionController } from './payment-provider-connection.controller';
import { EventModule } from 'src/events/event.module';
import { PaymentModule } from 'src/payment/payment.module';
import { CreditCardService } from './payment-processors/credit-card.service';
import { HttpModule } from '@nestjs/axios';
import { PrepaymentService } from './payment-processors/prepayment.service';
import { InvoiceService } from './payment-processors/invoice.service';
import { PaymentInformationModule } from 'src/payment-information/payment-information.module';
import { ConnectorService } from './connector.service';
import { ConfigurationModule } from 'src/configuration/configuration.module';

/**
 * Module for handling payment provider connections.
 */
@Module({
  imports: [
    PaymentModule,
    forwardRef(() => EventModule),
    PaymentInformationModule,
    HttpModule,
    ConfigurationModule,
  ],
  providers: [
    PaymentProviderConnectionService,
    ConnectorService,
    CreditCardService,
    PrepaymentService,
    InvoiceService,
    Logger,
  ],
  controllers: [PaymentProviderConnectionController],
  exports: [PaymentProviderConnectionService],
})
export class PaymentProviderConnectionModule {}
