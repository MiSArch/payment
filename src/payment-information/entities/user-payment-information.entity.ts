import { ObjectType, Field } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { UUID } from 'src/shared/scalars/CustomUuidScalar';
import { PaymentMethod } from 'src/payment-method/payment-method.enum';

// to remove user information from all non-employee queries
@ObjectType({ description: 'The users view of a stored payment information' })
export class UserPaymentInformation {
  _id: string;

  @Field(() => UUID, {
    description: 'The uuid identifier of the payment information',
  })
  get id(): string {
    return this._id;
  }

  @Field(() => PaymentMethod, {
    description: 'The corresponding payment method',
  })
  paymentMethod: PaymentMethod;

  @Field(() => GraphQLJSONObject)
  methodDetails?: object;
}
