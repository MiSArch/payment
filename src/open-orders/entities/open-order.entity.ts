import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { OrderDTO } from 'src/events/dto/order/order.dto';

/**
 * Represents an open order.
 * Required to pass order Context to downstream services without having to query the order service again.
 * @property paymentId - The ID of the payment associated with the order.
 * @property order - The order context.
 */
@Schema()
export class OpenOrder {
  @Prop({ required: true })
  paymentId: string;

  @Prop({ required: true })
  order: OrderDTO;

  @Prop({ required: true })
  orderId: string;
}

export const OpenOrderSchema = SchemaFactory.createForClass(OpenOrder);
