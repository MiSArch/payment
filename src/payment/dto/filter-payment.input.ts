import { InputType, Field } from '@nestjs/graphql';
import { PaymentMethod } from 'src/payment-method/payment-method.enum';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';

@InputType({ description: 'Filtering options for payments' })
export class PaymentFilter {
  @Field(() => PaymentStatus, {
    description: 'Current payment status',
    nullable: true,
  })
  status?: PaymentStatus;

  @Field({ description: 'Payment Information ID', nullable: true})
  paymentInformationId?: string;

  @Field({ description: 'Payment method', nullable: true})
  paymentMethod?: PaymentMethod;

  @Field({ description: 'Timebox start for payment creation', nullable: true})
  from?: Date;

  @Field({ description: 'Timebox end for payment creation', nullable: true})
  to?: Date;
}
