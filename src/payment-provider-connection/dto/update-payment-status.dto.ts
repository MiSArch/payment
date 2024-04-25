import { IsEnum, IsString } from 'class-validator';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';

/**
 * DTO for external requests, updating the payment status.
 */
export class UpdatePaymentStatusDto {
  @IsString()
  paymentId: string;

  @IsEnum(PaymentStatus)
  status: PaymentStatus;
}
