import { Injectable, Logger } from '@nestjs/common';
import { PaymentInformationService } from 'src/payment-information/payment-information.service';
import { PaymentService } from 'src/payment/payment.service';
import { EventPublisherService } from './event-publisher.service';
import { PaymentFailedDto } from './dto/payment/payment-failed.dto';
import { PaymentEnabledDto } from './dto/payment/payment-enabled.dto';
import { OrderDTO } from './dto/order/order.dto';
import { PaymentProcessedDto } from './dto/payment/payment-processed.dto';

@Injectable()
export class EventService {
  constructor(
    private readonly paymentInformationService: PaymentInformationService,
    private readonly paymentService: PaymentService,
    private readonly logger: Logger,
    private readonly eventPublisherService: EventPublisherService,
  ) {}

  startPaymentProcess(order: OrderDTO): Promise<any> {
    this.logger.log(
      `Received successfull discount validation event for order with id: ${order.id}`,
    );

    // Call the payment service to start the payment process
    return this.paymentService.create(order);
  }

  /**
   * Publishes a payment error event.
   * This event indicates that payment could not be enabled and product shipment should not be started.
   * @param order - The order context.
   */
  publishPaymentFailedEvent(order: OrderDTO): void {
    const eventPayload: PaymentFailedDto = { order };
    // send event
    this.eventPublisherService.publishEvent(
      'pubsub',
      'payment/payment/payment-failed',
      eventPayload,
    );
  }

  buildPaymentFailedEvent(paymentId: string): void {
    // get the order Context for the payment
  }

  /**
   * Publishes a payment enabled event.
   * This event indicates all actions necessary to later capture the payment were successfull.
   * @param order - The order context.
   */
  publishPaymentEnabledEvent(order: OrderDTO): void {
    const eventPayload: PaymentEnabledDto = { order };
    // send event
    this.eventPublisherService.publishEvent(
      'pubsub',
      'payment/payment/payment-enabled',
      eventPayload,
    );
  }

  buildPaymentEnabledEvent(paymentId: string): void {
    // get the order Context for the payment
  }

  /**
   * Publishes a payment success event.
   * This event indicates that full payment amount was captured.
   * @param order - The order context.
   */
  publishPaymentProcessedEvent(order: OrderDTO): void {
    const eventPayload: PaymentProcessedDto = { order };
    // send event
    this.eventPublisherService.publishEvent(
      'pubsub',
      'payment/payment/payment-processed',
      eventPayload,
    );
  }

  buildPaymentProcessedEvent(paymentId: string): void {
    // get the order Context for the payment
  }
}
