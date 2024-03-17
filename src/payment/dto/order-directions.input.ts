import { InputType, Field } from '@nestjs/graphql';
import { OrderDirection } from 'src/shared/enums/order-direction.enum';
import { PaymentOrderField } from 'src/shared/enums/payment-order-fields.enum';

@InputType({ description: 'Ordering options for product items' })
export class PaymentOrder {
  @Field(() => PaymentOrderField, {
    description: 'The field to order by',
    nullable: true,
  })
  field: PaymentOrderField;

  @Field(() => OrderDirection, {
    description: 'The direction to order by',
    nullable: true,
  })
  direction: OrderDirection;
}
