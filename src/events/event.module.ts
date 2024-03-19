import { Logger, Module, forwardRef } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventPublisherService } from './event-publisher.service';
import { PaymentModule } from 'src/payment/payment.module';
import { PaymentInformationModule } from 'src/payment-information/payment-information.module';
import { EventService } from './events.service';
import { PaymentProviderConnectionModule } from 'src/payment-provider-connection/payment-provider-connection.module';
import { OpenOrdersModule } from 'src/open-orders/open-orders.module';

@Module({
  imports: [
    forwardRef(() => PaymentProviderConnectionModule),
    PaymentInformationModule,
    PaymentModule,
    OpenOrdersModule,
  ],
  providers: [Logger, EventPublisherService, EventService, EventService],
  controllers: [EventController],
  exports: [EventService],
})
export class EventModule {}
