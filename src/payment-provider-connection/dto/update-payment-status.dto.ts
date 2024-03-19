import { IsEnum, IsString } from 'class-validator';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';

export class UpdatePaymentStatusDto {
  @IsString()
  paymentId: string;

  @IsEnum(PaymentStatus)
  status: PaymentStatus;
}
