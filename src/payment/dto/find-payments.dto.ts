import { Field, Int, ArgsType } from '@nestjs/graphql';
import { Min } from 'class-validator';
import { MAX_INT32 } from 'src/shared/constants/constants';
import { PaymentFilter } from './filter-payment.input';
import { PaymentOrder } from './order-directions.input';
import { PaymentOrderField } from 'src/shared/enums/payment-order-fields.enum';

/**
 * Arguments for finding payments.
 */
@ArgsType()
export class FindPaymentArgs {
  @Field(() => Int, {
    description: 'Number of items to skip',
    nullable: true,
  })
  @Min(0)
  skip: number = 0;

  @Field(() => Int, {
    description: 'Number of items to return',
    nullable: true,
  })
  @Min(1)
  first: number = MAX_INT32;

  @Field(() => PaymentOrder, {
    description: 'Ordering',
    nullable: true,
  })
  // default order is ascending by id
  orderBy: PaymentOrder = { field: PaymentOrderField.ID, direction: 1 };

  @Field(() => PaymentFilter, {
    description: 'Filtering',
    nullable: true,
  })
  filter?: PaymentFilter;
}
