import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Payment } from './entities/payment.entity';
import { Model } from 'mongoose';
import { FindPaymentArgs } from './dto/find-payments.dto';
import { PaymentConnection } from 'src/graphql-types/payment.connection';
import { PaymentOrderField } from 'src/shared/enums/payment-order-fields.enum';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name)
    private paymentModel: Model<Payment>,
    // initialize logger with service context
    private readonly logger: Logger,
  ) {}

  /**
   * Retrieves payment based on the provided arguments and filter.
   * @param args - The arguments for finding payment.
   * @param filter - The filter to apply when retrieving payment.
   * @returns A promise that resolves to an array of Payment objects.
   */
  async find(args: FindPaymentArgs, filter: any): Promise<Payment[]> {
    const { first, skip, orderBy } = args;
    this.logger.debug(
      `{find} query ${JSON.stringify(args)} with filter ${JSON.stringify(
        filter,
      )}`,
    );

    // retrieve the payments based on the provided arguments
    const payments = await this.paymentModel
      .find(filter)
      .limit(first)
      .skip(skip)
      .sort({ [orderBy.field]: orderBy.direction });

    this.logger.debug(`{find} returning ${payments.length} results`);

    return payments;
  }

  /**
   * Builds a payment connection based on the provided query and arguments.
   * @param query - The requested fields in the graphql query.
   * @param args - The arguments for filtering and pagination.
   * @returns A promise that resolves to a PaymentInformationConnection object.
   */
  async buildConnection(
    query: string[],
    args: FindPaymentArgs,
  ): Promise<PaymentConnection> {
    const { first, skip } = args;
    const connection = new PaymentConnection();

    // Every query that returns any element needs the 'nodes' part
    // as per the GraphQL Federation standard
    if (query.includes('nodes')) {
      // default order is ascending by id
      if (!args.orderBy) {
        args.orderBy = {
          field: PaymentOrderField.ID,
          direction: 1,
        };
      }

      // get nodes according to args and filter
      connection.nodes = await this.find(args, args.filter);
    }

    if (query.includes('totalCount') || query.includes('hasNextPage')) {
      connection.totalCount = await this.count(args.filter);
      connection.hasNextPage = skip + first < connection.totalCount;
    }
    return connection;
  }

  /**
   * Finds a payment record by its id.
   * @param _id - The id of the payment record.
   * @returns A promise that resolves to the found payment record.
   * @throws NotFoundException if the payment record with the specified id is not found.
   */
  async findById(_id: string): Promise<Payment> {
    this.logger.debug(`{findById} query: ${_id}`);

    // return all payment informations in the system
    const existingPayment = await this.paymentModel.findById(_id);

    if (!existingPayment) {
      throw new NotFoundException(`Payment with id "${_id}" not found`);
    }

    this.logger.debug(`{findById} returning ${existingPayment._id}`);
    return existingPayment;
  }

  /**
   * Counts the number of payment records in the system.
   * @param filter - The filter to apply to the count operation.
   * @returns A promise that resolves to the count of payment records.
   */
  async count(filter: any): Promise<number> {
    this.logger.debug(`{count} query: ${JSON.stringify(filter)}`);
    const count = await this.paymentModel.countDocuments(filter);

    this.logger.debug(`{count} returning ${count}`);

    return count;
  }

  /**
   * Deletes a payment.
   * Is only available for site admins
   * @param _id - The id of the payment to delete.
   * @returns The deleted payment.
   * @throws NotFoundException if the payment with the specified id is not found.
   * @throws UnauthorizedException if the user is not authorized to delete the payment.
   */
  async delete(_id: string): Promise<Payment> {
    this.logger.debug(`{delete} query: id: ${_id}`);

    // retrieve the payment
    const existingPayment = await this.paymentModel.findById(_id);

    // throw not found error if the payment does not exist
    if (!existingPayment) {
      this.logger.debug(`{delete} Payment with id "${_id}" not found`);
      throw new NotFoundException(`Payment with id "${_id}" not found`);
    }

    // delete the payment
    const deletedPayment = await this.paymentModel.findByIdAndDelete(_id);

    this.logger.debug(`{delete} returning ${JSON.stringify(deletedPayment)}`);
    return deletedPayment;
  }

  async startPaymentProcess(
    orderId: string,
    paymentInformationId: string,
    amount: number,
  ) {
    throw new Error('Method not implemented.');
  }
}
