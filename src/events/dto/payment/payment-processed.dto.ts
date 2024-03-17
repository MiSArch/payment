import { IsObject } from 'class-validator';
import { OrderDTO } from '../order/order.dto';

/**
 * DTO for a successful payment capture of an open payment.
 * @property order - The order for the payment was processed.
 */
export class PaymentProcessedDto {
  @IsObject()
  order: OrderDTO;
}
