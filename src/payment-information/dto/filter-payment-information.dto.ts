import { InputType, Field } from '@nestjs/graphql';
import { PaymentMethod } from 'src/payment-method/payment-method.enum';
import { UUID } from 'src/shared/scalars/CustomUuidScalar';

@InputType({ description: 'Filtering options for payment informations' })
export class PaymentInformationFilter {
  @Field(() => UUID, {
    description: 'Connected user id',
    nullable: true,
  })
  user?: string;

  @Field(() => PaymentMethod, {
    description: 'Linked payment method',
    nullable: true,
  })
  paymentMethod?: PaymentMethod;
}
