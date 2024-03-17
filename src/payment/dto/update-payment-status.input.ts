import { InputType, Field } from '@nestjs/graphql';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';
import { UUID } from 'src/shared/scalars/CustomUuidScalar';

@InputType()
export class UpdatePaymentStatusInput {
  @Field(() => UUID, { description: 'UUID of updated payment' })
  id: string;

  @Field(() => PaymentStatus, { description: 'New payment sattus' })
  status: PaymentStatus;
}
