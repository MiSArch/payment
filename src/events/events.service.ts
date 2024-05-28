import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { PaymentService } from 'src/payment/payment.service';
import { EventPublisherService } from './event-publisher.service';
import { PaymentFailedDto } from './dto/payment/payment-failed.dto';
import { PaymentEnabledDto } from './dto/payment/payment-enabled.dto';
import { OrderDTO } from './dto/order/order.dto';
import { PaymentProcessedDto } from './dto/payment/payment-processed.dto';
import { OpenOrdersService } from 'src/open-orders/open-orders.service';
import { OpenOrder } from 'src/open-orders/entities/open-order.entity';
import { PaymentProviderConnectionService } from 'src/payment-provider-connection/payment-provider-connection.service';

/**
 * Service for handling events.
 */
@Injectable()
export class EventService {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly eventPublisherService: EventPublisherService,
    private readonly openOrdersService: OpenOrdersService,
    // use forward reference to avoid circular dependency
    @Inject(forwardRef(() => PaymentProviderConnectionService))
    private readonly paymentProviderConnectionService: PaymentProviderConnectionService,
    private readonly logger: Logger,
  ) {}

  async startPaymentProcess(order: OrderDTO): Promise<any> {
    this.logger.log(`Starting payment process for order with id: ${order.id}`);
    // Call the payment service to start the payment process
    try {
      const { payment, paymentInformation } =
        await this.paymentService.create(order);
      // Temporarily store the order context for later events
      await this.openOrdersService.create(payment.id, order);

      // transfer to payment method controller to handle payment process
      this.paymentProviderConnectionService.startPaymentProcess(
        paymentInformation.paymentMethod,
        payment._id,
        order.compensatableOrderAmount,
      );
    } catch (error) {
      this.logger.error(`{startPaymentProcess} Fatal error: ${error}`);
      if (await this.openOrdersService.existsByOrderId(order.id)) {
        this.openOrdersService.delete({ orderId: order.id });
      }
      this.publishPaymentFailedEvent(order);
    }
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

  /**
   * Builds a payment failed event.
   * @param paymentId - The id of the payment.
   * @returns A promise that resolves to void.
   */
  async buildPaymentFailedEvent(paymentId: string): Promise<void> {
    // get the order Context for the payment
    const openOrder = await this.getOpenOrder(paymentId);
    return this.publishPaymentFailedEvent(openOrder.order);
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

  /**
   * Builds a payment enabled event.
   * @param paymentId - The id of the payment.
   * @returns A promise that resolves to void.
   */
  async buildPaymentEnabledEvent(paymentId: string): Promise<void> {
    // get the order Context for the payment
    const openOrder = await this.getOpenOrder(paymentId);
    return this.publishPaymentEnabledEvent(openOrder.order);
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

  /**
   * Builds a payment processed event.
   * @param paymentId - The id of the payment.
   * @returns A promise that resolves to void.
   */
  async buildPaymentProcessedEvent(paymentId: string): Promise<void> {
    // get the order Context for the payment
    const openOrder = await this.getOpenOrder(paymentId);
    // delete the open order
    this.openOrdersService.delete({ paymentId });
    return this.publishPaymentProcessedEvent(openOrder.order);
  }

  /**
   * Retrieves the open order for a given payment id.
   * @param paymentId - The id of the payment.
   * @returns A Promise that resolves to the open order.
   * @throws NotFoundException if the open order for the payment id is not found.
   */
  async getOpenOrder(paymentId: string): Promise<OpenOrder> {
    // get the saved order Context for the payment
    const openOrder = await this.openOrdersService.findOne(paymentId);

    if (!openOrder) {
      this.logger.error(
        `{getOpenOrder} Fatal Error: Could not find open order for payment with id: ${paymentId}.`,
      );
      throw new NotFoundException(
        `Open order for payment: ${paymentId} not found`,
      );
    }

    return openOrder;
  }
}
