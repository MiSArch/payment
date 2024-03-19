import { Logger, Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventPublisherService } from './event-publisher.service';
import { PaymentModule } from 'src/payment/payment.module';
import { PaymentInformationModule } from 'src/payment-information/payment-information.module';
import { EventService } from './events.service';

@Module({
  imports: [PaymentModule, PaymentInformationModule],
  providers: [Logger, EventPublisherService, EventService, EventService],
  controllers: [EventController],
  exports: [EventService],
})
export class EventModule {}
