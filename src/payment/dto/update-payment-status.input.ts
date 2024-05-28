import { InputType, Field } from '@nestjs/graphql';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';
import { UUID } from 'src/shared/scalars/CustomUuidScalar';

/**
 * Represents the input for updating the payment status from external payment provider.
 */
@InputType()
export class UpdatePaymentStatusInput {
  @Field(() => UUID, { description: 'UUID of updated payment' })
  id: string;

  @Field(() => PaymentStatus, { description: 'New payment status' })
  status: PaymentStatus;
}
