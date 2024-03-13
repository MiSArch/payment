import { Field, Int, ArgsType } from '@nestjs/graphql';
import { Min } from 'class-validator';
import { MAX_INT32 } from 'src/shared/constants/constants';
import { PaymentInformationOrder } from './order-directions.input';
import { ProductItemFilter } from './filter-payment-information.dto';

@ArgsType()
export class FindPaymentInformationsArgs {
  @Field(() => Int, {
    description: 'Number of items to skip',
    nullable: true,
  })
  @Min(0)
  skip?: number = 0;

  @Field(() => Int, {
    description: 'Number of items to return',
    nullable: true,
  })
  @Min(1)
  first?: number = MAX_INT32;

  @Field(() => PaymentInformationOrder, {
    description: 'Ordering',
    nullable: true,
  })
  orderBy?: PaymentInformationOrder;

  @Field(() => ProductItemFilter, {
    description: 'Filtering',
    nullable: true,
  })
  filter?: ProductItemFilter;
}
