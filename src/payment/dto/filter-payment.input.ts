import { InputType, Field } from '@nestjs/graphql';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';

@InputType({ description: 'Filtering options for payments' })
export class PaymentFilter {
  @Field(() => PaymentStatus, {
    description: 'Current payment status',
    nullable: true,
  })
  status?: PaymentStatus;
}
