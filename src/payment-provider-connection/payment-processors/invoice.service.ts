import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { EventService } from 'src/events/events.service';
import { PaymentService } from 'src/payment/payment.service';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';
import { ConnectorService } from '../connector.service';
import { Cron } from '@nestjs/schedule';
import { xDaysBackFromNow } from 'src/shared/utils/functions.utils';
import { PaymentMethod } from 'src/payment-method/payment-method.enum';

/**
 * Service for handling invoice payments.
 */
@Injectable()
export class InvoiceService {
  constructor(
    // initialize logger with service context
    private readonly logger: Logger,
    private readonly paymentService: PaymentService,
    private readonly connectionService: ConnectorService,
    @Inject(forwardRef(() => EventService))
    private readonly eventService: EventService,
  ) {}

  /**
   * Creates an invoice payment for the specified ID.
   * All required actions are in place, so the further steps in the saga are enabled.
   * @param id - The ID of the payment.
   * @returns A Promise that resolves to the created invoice payment.
   */
  async create(id: string): Promise<any> {
    this.logger.log(`{create} Creating invoice payment for id: ${id}`);
    // emit enabled event since everything necessary is in place
    this.eventService.buildPaymentEnabledEvent(id);

    // register the payment with the payment provider
    this.connectionService.send('register', { id, type: 'invoice' });

    // update the payment status
    return this.paymentService.updatePaymentStatus(id, PaymentStatus.PENDING);
  }

  /**
   * Updates the payment status for an invoice.
   * There are no relevant events which need to be emitted for an invoice payment.
   * @param paymentId - The payment id.
   * @param status - The new payment status.
   * @returns A Promise that resolves to the updated payment.
   */
  async update(paymentId: string, status: PaymentStatus): Promise<any> {
    this.logger.log(
      `{update} Updating invoice payment status for id: ${paymentId} to: ${status}`,
    );

    // update the payment status
    return this.paymentService.updatePaymentStatus(paymentId, status);
  }

  /**
   * Checks for open payments every 15 Mintutes and sets overdue payments to failed status.
   */
  @Cron('*/15 * * * *')
  async checkOpenPayments() {
    this.logger.log(`{checkOpenPayments} Checking open payments`);
    // TODO notify user about upcoming due date
    // build timestamp for 30 days from now
    const to = xDaysBackFromNow(30);
    // get open payments, that are at at least 6 days old
    const openPayments = await this.paymentService.find({
      filter: {
        status: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.INVOICE,
        to,
      },
    });
    // Set all overdue payments to failed
    for (const payment of openPayments) {
      this.logger.log(`[${payment._id}] Setting payment to failed since it is overdue`);
      this.paymentService.updatePaymentStatus(
        payment._id,
        PaymentStatus.FAILED,
      );

      // emit failed event
      this.eventService.buildPaymentFailedEvent(payment._id);
    }
  }
}
