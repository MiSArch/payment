import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCreditCardInformationInput } from './dto/create-creadit-card-information.input';
import { InjectModel } from '@nestjs/mongoose';
import { PaymentInformation } from './entities/payment-information.entity';
import { Model } from 'mongoose';
import { PaymentMethod } from 'src/payment-method/payment-method.enum';
import { User } from 'src/graphql-types/user.entity';
import { Role } from 'src/shared/enums/role.enum';
import { FindPaymentInformationsArgs } from './dto/find-payment-informations.args';
import { PaymentInformationConnection } from 'src/graphql-types/payment-information.connection.dto';
import { PaymentInformationOrderField } from 'src/shared/enums/payment-information-order-fields.enum';

/**
 * Service for handling payment information.
 */
@Injectable()
export class PaymentInformationService {
  constructor(
    @InjectModel(PaymentInformation.name)
    private paymentInformationModel: Model<PaymentInformation>,
    // initialize logger with service context
    private readonly logger: Logger,
  ) {}

  /**
   * Creates a credit card payment information for a user.
   * @param input - The input for creating the credit card information.
   * @param user - The user for whom the payment information is being created.
   * @returns A promise that resolves to the created payment information.
   */
  createCreditCardInformation(
    input: CreateCreditCardInformationInput,
    user: User,
  ): Promise<PaymentInformation> {
    this.logger.log(
      `{createCreditCardInformation} input: ${JSON.stringify(input)}`,
    );

    // build public method details
    const publicDetails = {
      cardHolder: input.cardHolder,
      // mask the card number with asterisks except for the last 4 digits
      cardNumber: input.cardNumber.replace(/\d(?=\d{4})/g, '*'),
      expirationDate: input.expirationDate,
    };

    // build paymentInformation
    return this.paymentInformationModel.create({
      paymentMethod: PaymentMethod.CREDIT_CARD,
      publicMethodDetails: publicDetails,
      secretMethodDetails: input,
      user: user.id,
    });
  }

  /**
   * Creates a new payment information record that requires no additional information.
   *
   * @param paymentMethod - The payment method to be associated with the payment information.
   * @param user - The user for whom the payment information is being created.
   * @returns A Promise that resolves to the created PaymentInformation object.
   */
  createPaymentInformation(
    paymentMethod: PaymentMethod,
    user: User,
  ): Promise<PaymentInformation> {
    this.logger.log(
      `{createPaymentInformation} input: ${{ paymentMethod, user: user.id }}`,
    );

    return this.paymentInformationModel.create({ paymentMethod, user });
  }

  /**
   * Retrieves payment information based on the provided arguments and filter.
   * User information is removed from the returned results since it is not exposed via GraphQL.
   *
   * @param args - The arguments for finding payment information.
   * @param filter - The filter to apply when retrieving payment information.
   * @returns A promise that resolves to an array of PaymentInformation objects.
   */
  async find(
    args: FindPaymentInformationsArgs,
    filter: any,
  ): Promise<PaymentInformation[]> {
    const { first, skip, orderBy } = args;
    this.logger.debug(
      `{find} query ${JSON.stringify(args)} with filter ${JSON.stringify(
        filter,
      )}`,
    );

    // retrieve the payment informations based on the provided arguments
    // remove user informations from return since it is not exposed via graphql
    const paymentInfos = await this.paymentInformationModel
      .find(filter)
      .select('-user')
      .limit(first)
      .skip(skip)
      .sort({ [orderBy.field]: orderBy.direction });

    this.logger.debug(`{find} returning ${paymentInfos.length} results`);

    return paymentInfos;
  }

  /**
   * Builds a payment information connection based on the provided query and arguments.
   * @param query - The requested fields in the graphql query.
   * @param args - The arguments for filtering and pagination.
   * @returns A promise that resolves to a PaymentInformationConnection object.
   */
  async buildConnection(
    query: string[],
    args: FindPaymentInformationsArgs,
  ): Promise<PaymentInformationConnection> {
    const { first, skip } = args;
    const connection = new PaymentInformationConnection();

    // Every query that returns any element needs the 'nodes' part
    // as per the GraphQL Federation standard
    if (query.includes('nodes')) {
      // default order is ascending by id
      if (!args.orderBy) {
        args.orderBy = {
          field: PaymentInformationOrderField.ID,
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
   * Finds a payment information record by its id.
   * @param _id - The id of the payment information record.
   * @returns A promise that resolves to the found payment information record.
   * @throws NotFoundException if the payment information record with the specified id is not found.
   */
  async findById(_id: string): Promise<PaymentInformation> {
    this.logger.debug(`{findById} query: ${_id}`);

    // return all payment informations in the system
    const existingInfo = await this.paymentInformationModel.findById(_id);

    if (!existingInfo) {
      throw new NotFoundException(
        `Payment Information with id "${_id}" not found`,
      );
    }

    this.logger.debug(`{findById} returning ${existingInfo._id}`);
    return existingInfo;
  }

  /**
   * Counts the number of payment information records in the system.
   * @param filter - The filter to apply to the count operation.
   * @returns A promise that resolves to the count of payment information records.
   */
  async count(filter: any): Promise<number> {
    this.logger.debug(`{count} query: ${JSON.stringify(filter)}`);
    const count = await this.paymentInformationModel.countDocuments(filter);

    this.logger.debug(`{count} returning ${count}`);

    return count;
  }

  /**
   * Deletes a payment information.
   * @param _id - The id of the payment information to delete.
   * @param user - The user associated with the request.
   * @param roles - The roles of the user associated with the request.
   * @returns The deleted payment information.
   * @throws NotFoundException if the payment information with the specified id is not found.
   * @throws UnauthorizedException if the user is not authorized to delete the payment information.
   */
  async delete(
    _id: string,
    user: User,
    roles: Role[],
  ): Promise<PaymentInformation> {
    this.logger.debug(
      `{delete} query: id: ${_id} user: ${user.id} roles: ${roles}`,
    );

    // retrieve the payment information
    const paymentInfo = await this.paymentInformationModel.findById(_id);

    // throw not found error if the payment information does not exist
    if (!paymentInfo) {
      this.logger.debug(
        `{delete} Payment Information with id "${_id}" not found`,
      );
      throw new NotFoundException(
        `Payment Information with id "${_id}" not found`,
      );
    }

    // roles authorized to delete foreign payment information
    const authorizedRoles = [Role.SITE_ADMIN, Role.EMPLOYEE];

    // check if the user is authorized to delete the payment information
    if (
      !roles.some((role) => authorizedRoles.includes(role)) &&
      paymentInfo.user.toString() !== user.id.toString()
    ) {
      this.logger.debug(
        `{delete} User ${user.id} not authorized to delete Payment Information with id "${_id}"`,
      );
      // throw not found error if the user is not authorized to delete the payment information
      throw new UnauthorizedException(
        `User not authorized to delete Payment Information with id "${_id}"`,
      );
    }

    // delete the payment information
    const deletedPaymentInfo =
      await this.paymentInformationModel.findByIdAndDelete(_id);

    this.logger.debug(
      `{delete} returning ${JSON.stringify(deletedPaymentInfo)}`,
    );
    return deletedPaymentInfo;
  }

  /**
   * Adds default payment informations (prepayment and invoice) for an user.
   *
   * @param user - The user for whom to add the default payment informations.
   * @returns A Promise that resolves to void.
   */
  async addDefaultPaymentInformations(user: User): Promise<void> {
    this.logger.log(`{addDefaultPaymentInformations} for user: ${user}`);

    // create default payment informations for the user
    await this.createPaymentInformation(PaymentMethod.PREPAYMENT, user);
    await this.createPaymentInformation(PaymentMethod.INVOICE, user);

    return;
  }
}
