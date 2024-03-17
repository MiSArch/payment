import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { EventPublisherService } from './event-publisher.service';
import { OrderDTO } from './dto/order/order.dto';
import { PaymentInformationService } from 'src/payment-information/payment-information.service';
import { ValidationSucceededDTO } from './dto/discount/discount-validation-succeeded.dto';
import { UserCreatedDto } from './dto/user/user-created.dto';
import { PaymentProcessedDto } from './dto/payment/payment-processed.dto';
import { PaymentFailedDto } from './dto/payment/payment-failed.dto copy 2';
import { PaymentService } from 'src/payment/payment.service';

@Controller()
export class EventController {
  constructor(
    private readonly paymentInformationService: PaymentInformationService,
    private readonly paymentService: PaymentService,
    private readonly logger: Logger,
    private readonly eventPublisherService: EventPublisherService,
  ) {}

  /**
   * Subscribes to the required discount and user service events.
   *
   * @returns A promise that resolves to an array of objects containing the pubsubName, topic, and route.
   */
  @Get('/dapr/subscribe')
  async subscribe(): Promise<any> {
    return [
      {
        pubsubName: 'pubsub',
        topic: 'discount/order/validation-succeeded',
        route: 'order-validation-succeeded',
      },
      {
        pubsubName: 'pubsub',
        topic: 'user/user/created',
        route: 'user-created',
      },
    ];
  }

  /**
   * Endpoint for order validation successfull events from the discount service.
   *
   * @param body - The event data received from Dapr.
   * @returns A promise that resolves to void.
   */
  @Post('order-validation-succeeded')
  async subscribeToProductVariantEvent(
    @Body('data') event: ValidationSucceededDTO,
  ): Promise<void> {
    // Extract the order context from the event
    const { order } = event;
    // Extract the payment information from the order
    const { id, paymentInformationId, compensatableOrderAmount } = order;

    this.logger.log(
      `Received successfull discount validation event for order with id: ${order.id}`,
    );

    // Call the payment service to start the payment process
    this.paymentService.startPaymentProcess(
      id,
      paymentInformationId,
      compensatableOrderAmount,
    );
  }

  /**
   * Endpoint for user creation events.
   *
   * @param userDto - The user data received from Dapr.
   * @returns A promise that resolves to void.
   */
  @Post('user-created')
  async subscribeToOrderEvent(
    @Body('data') user: UserCreatedDto,
  ): Promise<void> {
    // Handle incoming event data from Dapr
    this.logger.log(`Received user creation event: ${JSON.stringify(user)}`);

    try {
      // add default payment informations prepayment and invoice for the user
      this.paymentInformationService.addDefaultPaymentInformations({
        id: user.id,
      });
    } catch (error) {
      this.logger.error(`Error processing user created event: ${error}`);
    }
  }

  /**
   * Creates a payment success event.
   * This event indicates that full payment amount was captured.
   * @param order - The order context.
   */
  createPaymentProcessedEvent(order: OrderDTO): void {
    const eventPayload: PaymentProcessedDto = { order };
    // send event
    this.eventPublisherService.publishEvent(
      'pubsub',
      'payment/payment/payment-processed',
      eventPayload,
    );
  }

  /**
   * Creates a payment error event.
   * This event indicates that payment could not be enabled and product shipment should not be started.
   * @param order - The order context.
   */
  createPaymentFailedEvent(order: OrderDTO): void {
    const eventPayload: PaymentFailedDto = { order };
    // send event
    this.eventPublisherService.publishEvent(
      'pubsub',
      'payment/payment/payment-failed',
      eventPayload,
    );
  }

  /**
   * Creates an payment enabled event.
   * This event indicates all actions necessary to later capture the payment were successfull.
   * @param order - The order context.
   */
  createPaymentEnabledEvent(order: OrderDTO): void {
    const eventPayload: PaymentFailedDto = { order };
    // send event
    this.eventPublisherService.publishEvent(
      'pubsub',
      'payment/payment/payment-enabled',
      eventPayload,
    );
  }
}
