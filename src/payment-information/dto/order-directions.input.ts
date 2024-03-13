import { InputType, Field } from '@nestjs/graphql';
import { OrderDirection } from 'src/shared/enums/order-direction.enum';
import { PaymentInformationOrderField } from 'src/shared/enums/payment-information-order-fields.enum';

@InputType({ description: 'Ordering options for product items' })
export class PaymentInformationOrder {
  @Field(() => PaymentInformationOrderField, {
    description: 'The field to order by',
    nullable: true,
  })
  field: PaymentInformationOrderField;

  @Field(() => OrderDirection, {
    description: 'The direction to order by',
    nullable: true,
  })
  direction: OrderDirection;
}
