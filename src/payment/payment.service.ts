import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Payment } from './entities/payment.entity';
import { Model } from 'mongoose';
import { FindPaymentArgs } from './dto/find-payments.dto';
import { PaymentConnection } from 'src/graphql-types/payment.connection';
import { PaymentOrderField } from 'src/shared/enums/payment-order-fields.enum';
import { PaymentInformationService } from 'src/payment-information/payment-information.service';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';
import { OrderDTO } from 'src/events/dto/order/order.dto';
import { PaymentCreatedDto } from './dto/payment-created.dto';
import { PaymentFilter } from './dto/filter-payment.input';

/**
 * Service for handling payments.
 */
@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name)
    private paymentModel: Model<Payment>,
    private readonly paymentInformationService: PaymentInformationService,
    // initialize logger with service context
    private readonly logger: Logger,
  ) {}

  /**
   * Retrieves payment based on the provided arguments and filter.
   * @param args - The arguments for finding payment.
   * @param filter - The filter to apply when retrieving payment.
   * @returns A promise that resolves to an array of Payment objects.
   */
  async find(args: FindPaymentArgs): Promise<Payment[]> {
    const { first, skip, orderBy, filter } = args;
    // build query
    const query = this.buildQuery(filter);
    this.logger.debug(
      `{find} query ${JSON.stringify(args)} with filter ${JSON.stringify(
        query,
      )}`,
    );


    // retrieve the payments based on the provided arguments
    const payments = await this.paymentModel
      .find(query)
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
      connection.nodes = await this.find(args);
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
  async count(filter: PaymentFilter): Promise<number> {
    const filterQuery = this.buildQuery(filter);
    this.logger.debug(`{count} query: ${JSON.stringify(filterQuery)}`);
    const count = await this.paymentModel.countDocuments(filterQuery);

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

  /**
   * Creates a new payment entity and starts the payment process
   * @param order - The order information.
   * @returns A Promise that resolves to the created payment dto.
   * @throws NotFoundException if the payment information is not found.
   */
  async create(order: OrderDTO): Promise<PaymentCreatedDto> {
    // Extract the payment information from the order
    const { id, paymentInformationId, compensatableOrderAmount } = order;
    this.logger.log(
      `{create} Creating payment for order "${id}" with paymentInformationId "${paymentInformationId} and amount ${compensatableOrderAmount}`,
    );
    // get payment information
    const paymentInformation =
      await this.paymentInformationService.findById(paymentInformationId);

    if (!paymentInformation) {
      // fatal error that requires complete order compensation
      throw new NotFoundException(
        `Payment Information ${paymentInformationId} not found`,
      );
    }

    // create payment
    const payment = await this.paymentModel.create({
      id,
      paymentInformation,
      totalAmount: compensatableOrderAmount,
    });
    return { payment, paymentInformation };
  }

  /**
   * Updates the payment status of a payment.
   * @param _id - The ID of the payment.
   * @param status - The new status of the payment.
   * @returns A Promise that resolves to the updated Payment object.
   * @throws NotFoundException if the payment with the specified id is not found.
   */
  async updatePaymentStatus(_id: string, status: PaymentStatus): Promise<Payment> {
    this.logger.log(
      `{updatePaymentStatus} Updating payment status for id: "${_id}" to ${status}`,
    );
    const update: any = { status };
    // set payedAt if status is succeeded
    if (status === PaymentStatus.SUCCEEDED) {
      update.payedAt = new Date();
    }

    const existingPayment = await this.paymentModel
      .findOneAndUpdate({ _id }, update)
      .setOptions({ overwrite: true, new: true });

    if (!existingPayment) {
      throw new NotFoundException(`Payment with id "${_id}" not found`);
    }

    this.logger.debug(
      `{updatePaymentStatus} returning ${JSON.stringify(existingPayment)}`,
    );

    return existingPayment;
  }

  /**
   * Builds a query object based on the provided filter.
   * @param filter - The filter object containing the criteria for the query.
   * @returns The query object.
   */
  buildQuery(filter: PaymentFilter): {
    status?: string;
    paymentInformation?: string;
    paymentMethod?: string;
    createdAt?: { $gte: Date; $lte: Date };
  } {
    const query: any = {};

    if (!filter) { return query }

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.paymentInformationId) {
      query.paymentInformation = filter.paymentInformationId;
    }

    if (filter.paymentMethod) {
      query.paymentMethod = filter.paymentMethod;
    }

    if (filter.from) {
      query.createdAt = {
        $gte: filter.from,
      };
    }

    if (filter.to) {
      query.createdAt = {
        ...query.createdAt,
        $lte: filter.to,
      };
    }
    return query;
  }
}
