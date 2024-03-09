import { ObjectType, Field, Directive } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { UUID } from 'src/shared/scalars/CustomUuidScalar';
import { v4 as uuidv4 } from 'uuid';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PaymentMethod } from 'src/payment-method/payment-method.enum';
import { User } from 'src/graphql-types/user.entity';

@ObjectType({ description: 'A stored payment information of an user' })
@Schema({
  versionKey: false,
  id: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
@Directive('@key(fields: "id")')
export class PaymentInformation {
  @Prop({ required: true, default: uuidv4 })
  _id: string;

  @Field(() => UUID, {
    description: 'The uuid identifier of the payment information',
  })
  get id(): string {
    return this._id;
  }

  @Prop({ required: true })
  @Field(() => PaymentMethod, {
    description: 'The corresponding payment method',
  })
  paymentMethod: PaymentMethod;

  @Prop({ required: false, type: Object })
  @Field(() => GraphQLJSONObject)
  methodDetails?: object;

  @Prop({ required: true })
  @Field(() => User, {
    description: 'The user who owns the payment information',
  })
  user: User;
}

export const PaymentInformationSchema =
  SchemaFactory.createForClass(PaymentInformation);

PaymentInformationSchema.virtual('id').get(function () {
  return this._id;
});
