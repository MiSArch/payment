import {
  ObjectType,
  Field,
  Float,
  Directive,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UUID } from 'src/shared/scalars/CustomUuidScalar';
import { v4 as uuidv4 } from 'uuid';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';
import { PaymentInformation } from 'src/payment-information/entities/payment-information.entity';

@ObjectType({ description: 'A payment of an invoice or return' })
@Schema({
  versionKey: false,
  // to replace the default _id field with a custom id field
  id: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: true,
})
@Directive('@key(fields: "id")')
export class Payment {
  @Prop({ required: true, default: uuidv4 })
  _id: string;

  @Field(() => UUID, { description: 'The uuid identifier of the payment' })
  get id(): string {
    return this._id;
  }

  // Total amount in the smallest currency unit (e.g. cents)
  @Prop({ required: true })
  @Field(() => Float, {
    description: 'Payment Amount in the smallest currency unit (e.g. cents)',
  })
  totalAmount: number;

  @Prop({ required: true })
  @Field(() => PaymentStatus, {
    description: 'Status of the payment',
    defaultValue: PaymentStatus.OPEN,
  })
  status: PaymentStatus = PaymentStatus.OPEN;

  @Prop({ required: true })
  @Field(() => PaymentInformation, { description: 'Used Payment Information' })
  paymentInformation: PaymentInformation;

  @Prop()
  @Field(() => GraphQLISODateTime, {
    description: 'Date of the payment',
    nullable: true,
  })
  payedAt?: Date;

  @Prop()
  @Field(() => Number, {
    description: 'Number of retries for the payment process',
    defaultValue: 0,
  })
  numberOfRetries: number = 0;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.virtual('id').get(function () {
  return this._id;
});
