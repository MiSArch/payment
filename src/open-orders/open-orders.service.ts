import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OrderDTO } from 'src/events/dto/order/order.dto';
import { OpenOrder } from './entities/open-order.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

/**
 * Service for handling open orders.
 */
@Injectable()
export class OpenOrdersService {
  constructor(
    @InjectModel(OpenOrder.name)
    private openOrderModel: Model<OpenOrder>,
    private readonly logger: Logger,
  ) {}

  /**
   * Creates an open order for a payment and order.
   * @param paymentId - The ID of the payment.
   * @param order - The order data.
   * @returns A promise that resolves to the created open order.
   */
  create(paymentId: string, order: OrderDTO): Promise<OpenOrder> {
    this.logger.log(
      `{create} Creating open order for payment: ${paymentId} and order: ${order.id}`,
    );
    return this.openOrderModel.create({ paymentId, orderId: order.id, order });
  }

  /**
   * Finds an open order by payment ID.
   * @param paymentId - The ID of the payment.
   * @returns A Promise that resolves to the found open order.
   * @throws NotFoundException if the open order is not found.
   */
  async findOne(paymentId: string): Promise<OpenOrder> {
    this.logger.log(`{findOne} Finding open order for payment: ${paymentId}`);
    const openOrder = await this.openOrderModel.findOne({ paymentId });

    if (!openOrder) {
      throw new NotFoundException(
        `Open order for payment: ${paymentId} not found`,
      );
    }

    return openOrder;
  }

  /**
   * Checks if an open order exists by payment ID.
   * @param paymentId - The ID of the payment.
   * @returns A Promise that resolves to a boolean indicating if the open order exists.
   */
  async existsByOrderId(orderId: string): Promise<boolean> {
    this.logger.log(`{existsByPaymentId} Checking if open order exists for payment: ${orderId}`);
    const openOrder = await this.openOrderModel.findOne({ orderId });
    return !!openOrder;
  }

  /**
   * Deletes an open order by payment ID.
   * @param paymentId - The ID of the payment associated with the open order.
   * @returns A Promise that resolves to the deleted open order.
   * @throws NotFoundException if the open order is not found.
   */
  async delete(paymentId: string): Promise<OpenOrder> {
    this.logger.log(`{delete} Deleting open order for payment: ${paymentId}`);

    const deletedOrder = await this.openOrderModel.findOneAndDelete({
      paymentId,
    });

    if (!deletedOrder) {
      throw new NotFoundException(
        `Open order for payment: ${paymentId} not found`,
      );
    }

    return deletedOrder;
  }
}
