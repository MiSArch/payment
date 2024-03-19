import { PaymentInformation } from 'src/payment-information/entities/payment-information.entity';
import { Payment } from '../entities/payment.entity';

/**
 * Represents the data transfer object for a payment creation event.
 * @property payment - The payment entity.
 * @property paymentInformation - The payment information entity.
 */
export class PaymentCreatedDto {
  payment: Payment;
  paymentInformation: PaymentInformation;
}
