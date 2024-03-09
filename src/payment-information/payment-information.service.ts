import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateCCInformationInput } from './dto/create-creadit-card-information.input';
import { InjectModel } from '@nestjs/mongoose';
import { PaymentInformation } from './entities/payment-information.entity';
import { Model } from 'mongoose';
import { PaymentMethod } from 'src/payment-method/payment-method.enum';
import { User } from 'src/graphql-types/user.entity';
import { UserPaymentInformation } from './entities/user-payment-information.entity';

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
   * @param ccInput - The input for creating the credit card information.
   * @param user - The user for whom the payment information is being created.
   * @returns A promise that resolves to the created payment information.
   */
  createCreditCardInformation(
    ccInput: CreateCCInformationInput,
    user: User,
  ): Promise<UserPaymentInformation> {
    this.logger.log(`{createCreditCardInformation} input: ${ccInput}`);

    // build paymentInformation
    return this.paymentInformationModel.create({
      paymentMethod: PaymentMethod.CREDIT_CARD,
      methodDetails: ccInput,
      user,
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
  ): Promise<UserPaymentInformation> {
    this.logger.log(
      `{createPaymentInformation} input: ${{ paymentMethod, user }}`,
    );

    return this.paymentInformationModel.create({ paymentMethod, user });
  }

  /**
   * Retrieves the payment information associated with a user.
   * @param user - The user for whom to retrieve the payment information.
   * @returns A promise that resolves to an array of PaymentInformation objects.
   */
  async findUserPaymentInformation(
    user: User,
  ): Promise<UserPaymentInformation[]> {
    this.logger.debug(`{findUserPaymentInformation} input: ${user}`);
    const infos = await this.paymentInformationModel
      .find({ user })
      .select('-user');

    this.logger.debug(
      `{findUserPaymentInformation} returning ${infos.length} results`,
    );

    return infos;
  }

  /**
   * Retrieves all payment information in the system.
   * @returns A promise that resolves to an array of PaymentInformation objects.
   */
  async findAll(): Promise<PaymentInformation[]> {
    this.logger.debug(`{findAll}`);

    // return all payment informations in the system
    const infos = await this.paymentInformationModel.find({});

    this.logger.debug(`{findAll} returning ${infos.length} results`);
    return infos;
  }

  async findById(_id: string): Promise<PaymentInformation> {
    this.logger.debug(`{fondOne} query: ${_id}`);

    // return all payment informations in the system
    const existingInfo = await this.paymentInformationModel.findById(_id);

    if (!existingInfo) {
      throw new NotFoundException(
        `Payment Information with ID "${_id}" not found`,
      );
    }

    this.logger.debug(`{findOne} returning ${existingInfo._id}`);
    return existingInfo;
  }

  /**
   * Deletes a user's payment information.
   * @param id - The ID of the payment information to delete.
   * @param user - The user object associated with the payment information.
   * @returns The deleted payment information.
   */
  async deleteUsersPaymentInformation(
    id: string,
    user: User,
  ): Promise<UserPaymentInformation> {
    this.logger.debug(
      `{deleteUsersPaymentInformation} query: { id ${id} user ${user} }`,
    );

    const deletedPaymentInfo = await this.paymentInformationModel
      .findOneAndDelete({ _id: id, user })
      .select('-user');

    this.logger.debug(
      `{deleteUsersPaymentInformation} returning ${JSON.stringify(deletedPaymentInfo)}`,
    );

    return deletedPaymentInfo;
  }

  /**
   * Deletes a payment information.
   * @param _id - The ID of the payment information to delete.
   * @returns The deleted payment information.
   */
  async delete(_id: string): Promise<PaymentInformation> {
    // delete a payment Information
    this.logger.debug(`{delete} query: ${_id}`);

    const deletedPaymentInfo =
      await this.paymentInformationModel.findByIdAndDelete(_id);

    this.logger.debug(
      `{delete} returning ${JSON.stringify(deletedPaymentInfo)}`,
    );
    return deletedPaymentInfo;
  }
}
