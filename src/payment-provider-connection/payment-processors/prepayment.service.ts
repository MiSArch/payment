import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { EventService } from 'src/events/events.service';
import { PaymentService } from 'src/payment/payment.service';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';
import { ConnectorService } from '../connector.service';
import { Cron } from '@nestjs/schedule';
import { PaymentMethod } from 'src/payment-method/payment-method.enum';
import { xDaysBackFromNow } from 'src/shared/utils/functions.utils';

/**
 * Service for handling invoice payments.
 */
@Injectable()
export class PrepaymentService {
  constructor(
    // initialize logger with service context
    private readonly logger: Logger,
    private readonly paymentService: PaymentService,
    private readonly connectionService: ConnectorService,
    @Inject(forwardRef(() => EventService))
    private readonly eventService: EventService,
  ) {}

  /**
   * Creates an prepaid payment for the specified id.
   * The payment needs to arrive before further steps in the saga are enabled.
   * @param id - The id of the payment.
   * @returns A Promise that resolves to the created prepaid payment.
   */
  async create(id: string): Promise<any> {
    this.logger.log(`{create} Creating prepaid payment for id: ${id}`);

    // register the payment with the payment provider
    this.connectionService.send('register', { id, type: 'prepayment' });

    // update the payment status
    return this.paymentService.updatePaymentStatus(id, PaymentStatus.PENDING);
  }

  /**
   * Updates the payment status for an prepaid payment.
   * If the payment has succeeded, the further steps in the saga are enabled.
   * @param paymentId - The payment id.
   * @param status - The new payment status.
   * @returns A Promise that resolves to the updated payment.
   */
  async update(paymentId: string, status: PaymentStatus): Promise<any> {
    this.logger.log(
      `{update} Updating prepaid payment status for id: ${paymentId} to: ${status}`,
    );

    if (status !== PaymentStatus.SUCCEEDED) {
      return this.paymentService.updatePaymentStatus(paymentId, status);
    }

    // emit enabled event since everything necessary is in place
    this.eventService.buildPaymentEnabledEvent(paymentId);
  }

  /**
   * Checks for open payments every 5 Mintutes and sets overdue payments to failed status.
   */
  @Cron('5 * * * *')
  async checkOpenPayments() {
    this.logger.log(`{checkOpenPayments} Checking open payments`);
    // TODO notify user about upcoming due date
    // build timestamp for 6 days from now
    const to = xDaysBackFromNow(7);
    // get open payments, that are at at least 6 days old
    const openPayments = await this.paymentService.find(
      {
        filter: {
          status: PaymentStatus.PENDING,
          paymentMethod: PaymentMethod.PREPAYMENT,
          to,
        }
      },
    );

    // Set all overdue payments to failed
    for (const payment of openPayments) {
      this.paymentService.updatePaymentStatus(
        payment._id,
        PaymentStatus.FAILED,
      );

      // emit failed event
      this.eventService.buildPaymentFailedEvent(payment._id);
    }
  }
}
