import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { ValidationSucceededDTO } from './dto/discount/discount-validation-succeeded.dto';
import { UserCreatedDto } from './dto/user/user-created.dto';
import { EventService } from './events.service';
import { PaymentInformationService } from 'src/payment-information/payment-information.service';

@Controller()
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private readonly paymentInformationService: PaymentInformationService,
    private readonly logger: Logger,
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
  async orderValidationSucceeded(
    @Body('data') event: ValidationSucceededDTO,
  ): Promise<void> {
    // Extract the order context from the event
    const { order } = event;
    this.logger.log(`Received discount order validation success event for order "${order.id}"`);

    try {
      this.eventService.startPaymentProcess(order);
    } catch (error) {
      this.logger.error(
        `Error processing order validation success event: ${error}`,
      );
    }
  }

  /**
   * Endpoint for user creation events.
   *
   * @param userDto - The user data received from Dapr.
   * @returns A promise that resolves to void.
   */
  @Post('user-created')
  async userCreated(@Body('data') user: UserCreatedDto): Promise<void> {
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
}
