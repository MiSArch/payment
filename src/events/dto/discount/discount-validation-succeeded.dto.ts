import { IsObject } from 'class-validator';
import { OrderDTO } from '../order/order.dto';

/**
 * DTO for a successful validation of all discounts in an order.
 * @property order - The order for which all discounts were successfully validated.
 */
export class ValidationSucceededDTO {
  @IsObject()
  order: OrderDTO;
}
