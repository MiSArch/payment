import { IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * DTO to register payments with external provider
 * @property paymentId - The id of the payment.
 * @property amount - The amount of the payment.
 * @property paymentType - The payment method.
 */
export class RegisterPaymentDto {
  @IsString()
  paymentId: string;

  @IsNumber()
  amount: number;

  @IsString()
  paymentType: string;

  @IsOptional()
  paymentAuthorization?: object;
}
