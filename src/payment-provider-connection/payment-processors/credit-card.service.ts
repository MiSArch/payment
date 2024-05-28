import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { EventService } from 'src/events/events.service';
import { PaymentService } from 'src/payment/payment.service';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';
import { ConnectorService } from '../connector.service';
import { RegisterPaymentDto } from '../dto/register-payment.dto';

/**
 * Service for handling credit card payments.
 */
@Injectable()
export class CreditCardService {
  constructor(
    // initialize logger with service context
    private readonly logger: Logger,
    private readonly paymentService: PaymentService,
    private readonly connectionService: ConnectorService,
    @Inject(forwardRef(() => EventService))
    private readonly eventService: EventService,
  ) {}

  /**
   * Creates a credit card payment for the specified id.
   * @param id - The id of the payment.
   * @param amount - The amount to pay in cent.
   * @param CVC - The credit card CVC.
   * @returns A Promise that resolves to the created payment.
   */
  async create(id: string, amount: number, authorization: any): Promise<any> {
    this.logger.log(`{create} Creating credit card payment for id: ${id}`);
    // emit enabled event since everything necessary is in place
    this.eventService.buildPaymentEnabledEvent(id);

    // register the payment with the payment provider
    const dto: RegisterPaymentDto = {
      paymentId: id,
      amount,
      paymentType: 'credit-card',
      paymentAuthorization: authorization,
    };
    this.connectionService.send(dto);

    // update the payment status
    return this.paymentService.updatePaymentStatus(id, PaymentStatus.PENDING);
  }

  /**
   * Updates the credit card payment status for the specified payment id.
   * @param paymentId - The id of the payment.
   * @param status - The status to update the payment to.
   * @returns A Promise that resolves to the updated payment.
   */
  async update(paymentId: string, status: PaymentStatus): Promise<any> {
    this.logger.log(
      `{update} Updating credit card payment status for id: ${paymentId} to: ${status}`,
    );

    // update the payment status since there is no further action required
    if (status !== PaymentStatus.FAILED) {
      return this.paymentService.updatePaymentStatus(paymentId, status);
    }

    this.eventService.buildPaymentFailedEvent(paymentId);
    return this.paymentService.updatePaymentStatus(paymentId, PaymentStatus.INKASSO);
  }
}
