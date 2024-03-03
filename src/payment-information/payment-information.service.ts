import { Injectable, Logger } from '@nestjs/common';
import { CreateCCInformationInput } from './dto/create-creadit-card-information.input';
import { InjectModel } from '@nestjs/mongoose';
import { PaymentInformation } from './entities/payment-information.entity';
import { Model } from 'mongoose';
import { PaymentMethod } from 'src/payment-method/payment-method.enum';
import { User } from 'src/graphql-types/user.entity';

@Injectable()
export class PaymentInformationService {
  constructor(
    @InjectModel(PaymentInformation.name)
    private paymentInformationModel: Model<PaymentInformation>,
    // initialize logger with service context
    private readonly logger: Logger,
  ) {}

  // method for credit cards
  createCreditCardInformation(
    ccInput: CreateCCInformationInput,
    user: User,
  ): Promise<PaymentInformation> {
    // add credit card as payment information
    this.logger.log(`{createCreditCardInformation} input: ${ccInput}`);

    // build paymentInformation
    return this.paymentInformationModel.create({
      paymentMethod: PaymentMethod.CREDIT_CARD,
      methodDetails: ccInput,
      user,
    });
  }

  // method for all paymentInformations, that require no additional data
  createPaymentInformation(
    paymentMethod: PaymentMethod,
    user: User,
  ): Promise<PaymentInformation> {
    // add credit card as payment information
    this.logger.log(
      `{createPaymentInformation} input: ${{ paymentMethod, user }}`,
    );

    // build paymentInformation
    return this.paymentInformationModel.create({ paymentMethod, user });
  }

  findUserPaymentInformation(user: User) {
    // return all payment informations stored by the user
    this.logger.log(`{findUserPaymentInformation} input: ${user}`);
    return this.paymentInformationModel.find({ user });
  }

  findAll() {
    // return all payment informations in the system
    return this.paymentInformationModel.find({});
  }

  async deleteUsersPaymentInformation(id: string, user: User) {
    // delete a users paymentMethod
    this.logger.debug(`{deleteUsersPaymentInformation} query: ${{ id, user }}`);

    const deletedPaymentInfo =
      await this.paymentInformationModel.findOneAndDelete({
        id,
        user,
      });

    this.logger.debug(
      `{deleteUsersPaymentInformation} returning ${JSON.stringify(deletedPaymentInfo)}`,
    );
  }

  async delete(_id: string) {
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
