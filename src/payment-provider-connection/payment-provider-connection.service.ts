import {
  Injectable,
  Logger,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { PaymentInformationService } from 'src/payment-information/payment-information.service';
import { PaymentMethod } from 'src/payment-method/payment-method.enum';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';
import { CreditCardService } from './payment-processors/credit-card.service';
import { InvoiceService } from './payment-processors/invoice.service';
import { PrepaymentService } from './payment-processors/prepayment.service';

/**
 * Service for handling payment provider connections.
 */
@Injectable()
export class PaymentProviderConnectionService {
  constructor(
    private readonly paymentInformationService: PaymentInformationService,
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
   * @returns A promise that resolves when the payment process is started.
   * @throws {NotImplementedException} If the controller for the payment method is not implemented.
   */
  startPaymentProcess(paymentMethod: PaymentMethod, id: string): Promise<any> {
    this.logger.log(
      `{startPaymentProcess} Starting payment for paymentMethod: ${paymentMethod}`,
    );
    // call the create function of the appropriate payment method controller
    switch (paymentMethod) {
      case PaymentMethod.CREDIT_CARD:
        return this.creditCardService.create(id);
      case PaymentMethod.PREPAYMENT:
        return this.prepaymentService.create(id);
      case PaymentMethod.INVOICE:
        return this.invoiceService.create(id);
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
   * @throws {NotFoundException} If the payment is not found.
   * @throws {NotImplementedException} If the controller for the payment method is not implemented.
   */
  async updatePaymentStatus(id: string, status: PaymentStatus): Promise<any> {
    // get the payment method from the payment
    const paymentInfo = await this.paymentInformationService.findById(id);

    if (!paymentInfo) {
      this.logger.error(
        `{updatePaymentStatus} Fatal error: Payment not found for id: ${id}`,
      );
      throw new NotFoundException('Payment not found');
    }

    const { paymentMethod } = paymentInfo;

    // call the create function of the appropriate payment method controller
    switch (paymentMethod) {
      case PaymentMethod.CREDIT_CARD:
        return this.creditCardService.update(id, status);
      case PaymentMethod.PREPAYMENT:
        return this.prepaymentService.update(id, status);
      case PaymentMethod.INVOICE:
        return this.prepaymentService.update(id, status);
      default:
        throw new NotImplementedException(
          'Controller for Payment Method not implemented',
        );
    }
  }
}
