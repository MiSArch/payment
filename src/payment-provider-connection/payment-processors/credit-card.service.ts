import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { EventService } from 'src/events/events.service';
import { Payment } from 'src/payment/entities/payment.entity';
import { PaymentService } from 'src/payment/payment.service';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';
import { ConnectorService } from '../connector.service';

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

  async create(id: string): Promise<any> {
    this.logger.log(`{create} Creating credit card payment for id: ${id}`);
    // emit enabled event since everything necessary is in place
    this.eventService.buildPaymentEnabledEvent(id);

    // register the payment with the payment provider
    this.connectionService.send('register', { id, type: 'credit-card' });

    // update the payment status
    return this.paymentService.updatePaymentStatus(id, PaymentStatus.PENDING);
  }

  async update(paymentId: string, status: PaymentStatus): Promise<any> {
    this.logger.log(
      `{update} Updating credit card payment status for id: ${paymentId} to: ${status}`,
    );

    // update the payment status since there is no further action required
    if (status !== PaymentStatus.FAILED) {
      return this.paymentService.updatePaymentStatus(paymentId, status);
    }

    // get the payment
    const payment: Payment = await this.paymentService.findById(paymentId);
    const { numberOfRetries } = payment;

    // check if the payment has reached the maximum number of retries
    if (numberOfRetries >= 3) {
      // emit failed event
      this.eventService.buildPaymentFailedEvent(paymentId);

      // update the payment status
      return this.paymentService.updatePaymentStatus(paymentId, status);
    }

    // otherwise retry the payment
    return this.connectionService.send('register', {
      paymentId,
      type: 'credit-card',
    });
  }
}
