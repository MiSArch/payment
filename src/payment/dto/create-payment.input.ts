import { InputType, Field } from '@nestjs/graphql';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';

@InputType()
export class CreatePaymentInput {
  @Field(() => Number, { description: 'Payment amount in EUR' })
  amount: number;

  @Field(() => PaymentStatus, {
    defaultValue: PaymentStatus.OPEN,
    description: 'Current payment status',
  })
  status: PaymentStatus;
}
