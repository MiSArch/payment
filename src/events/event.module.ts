import { Logger, Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventPublisherService } from './event-publisher.service';
import { PaymentModule } from 'src/payment/payment.module';
import { PaymentInformationModule } from 'src/payment-information/payment-information.module';

@Module({
  imports: [PaymentModule, PaymentInformationModule],
  providers: [Logger, EventPublisherService],
  controllers: [EventController],
})
export class EventModule {}
