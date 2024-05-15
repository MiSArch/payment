import {
  Injectable,
  Logger,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { PaymentMethod } from 'src/payment-method/payment-method.enum';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';
import { CreditCardService } from './payment-processors/credit-card.service';
import { InvoiceService } from './payment-processors/invoice.service';
import { PrepaymentService } from './payment-processors/prepayment.service';
import { PaymentService } from 'src/payment/payment.service';
import { PaymentAuthorization } from 'src/events/dto/order/order.dto';

/**
 * Service for handling payment provider connections.
 */
@Injectable()
export class PaymentProviderConnectionService {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly creditCardService: CreditCardService,
    private readonly prepaymentService: PrepaymentService,
    private readonly invoiceService: InvoiceService,
    // initialize logger with service context
    private readonly logger: Logger,
  ) {}

  /**
   * Starts the payment process for the specified payment method and id.
   *
   * @param paymentMethod - The payment method to use for the payment process.
   * @param id - The id associated with the payment.
   * @param amount - The amount to pay in cent.
   * @returns A promise that resolves when the payment process is started.
   * @throws {NotImplementedException} If the controller for the payment method is not implemented.
   */
  startPaymentProcess(
    paymentMethod: PaymentMethod,
    id: string,
    amount: number,
    paymentAuthorization?: PaymentAuthorization,
  ): Promise<any> {
    this.logger.log(
      `{startPaymentProcess} Starting payment for paymentMethod: ${paymentMethod}`,
    );
    // call the create function of the appropriate payment method controller
    switch (paymentMethod) {
      case PaymentMethod.CREDIT_CARD:
        if (!paymentAuthorization) { throw new Error('Authorization missing') }
        return this.creditCardService.create(id, amount, paymentAuthorization);
      case PaymentMethod.PREPAYMENT:
        return this.prepaymentService.create(id, amount);
      case PaymentMethod.INVOICE:
        return this.invoiceService.create(id, amount);
      default:
        throw new NotImplementedException(
          'Controller for Payment Method not implemented',
        );
    }
  }

  /**
   * Updates the payment status for the specified payment method and id.
   *
   * @param id - The id associated with the payment.
   * @param status - The status to update the payment to.
   * @returns A promise that resolves when the payment status is updated.
   * @throws {NotFoundException} If the payment or paymentInformation is not found.
   * @throws {NotImplementedException} If the controller for the payment method is not implemented.
   */
  async updatePaymentStatus(id: string, status: PaymentStatus): Promise<any> {
    try {
      // get the payment method from the payment
      const payment = await this.paymentService.findById(id);
      if (typeof payment.paymentInformation === 'string') {
        throw new NotFoundException('Payment Information not found');
      }
      const paymentMethod: PaymentMethod =
        payment.paymentInformation.paymentMethod;
      this.logger.log(
        `{updatePaymentStatus} Updating payment [id] ${id} with method ${paymentMethod} to status ${status}`,
      );

      // call the create function of the appropriate payment method controller
      switch (paymentMethod) {
        case PaymentMethod.CREDIT_CARD:
          return this.creditCardService.update(id, status);
        case PaymentMethod.PREPAYMENT:
          return this.prepaymentService.update(id, status);
        case PaymentMethod.INVOICE:
          return this.invoiceService.update(id, status);
        default:
          throw new NotImplementedException(
            'Controller for Payment Method not implemented',
          );
      }
    } catch (error) {
      this.logger.error(
        `{updatePaymentStatus} Error updating payment status: ${error.message}`,
      );
      throw error;
    }
  }
}
