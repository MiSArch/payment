import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { PaymentInformationService } from './payment-information.service';
import { PaymentInformation } from './entities/payment-information.entity';
import { CreateCCInformationInput } from './dto/create-creadit-card-information.input';
import { Logger } from '@nestjs/common';
import { UUID } from 'src/shared/scalars/CustomUuidScalar';
import { CurrentUser } from 'src/shared/utils/user.decorator';
import { User } from 'src/graphql-types/user.entity';

@Resolver(() => PaymentInformation)
export class PaymentInformationResolver {
  constructor(
    private readonly paymentInformationService: PaymentInformationService,
    // initialize logger with resolver content
    private readonly logger: Logger,
  ) {}

  @Mutation(() => PaymentInformation, {
    name: 'createCreditCardPaymentInformation',
    description: 'Adds a credit card to the users stored payment informations',
  })
  createCCInformation(
    @Args('input') createCCInformationInput: CreateCCInformationInput,
    @CurrentUser() user: User,
  ) {
    return this.paymentInformationService.createCreditCardInformation(
      createCCInformationInput,
      user,
    );
  }

  @Query(() => [PaymentInformation], {
    name: 'paymentInformations',
    description: ' Retrieves all payment informations',
  })
  findAll() {
    return this.paymentInformationService.findAll();
  }

  @Query(() => [PaymentInformation], {
    name: 'userPaymentInformations',
    description: ' Retrieves all payment informations of an user',
  })
  findUserPaymentInformation(@CurrentUser() user: User) {
    return this.paymentInformationService.findUserPaymentInformation(user);
  }

  @Mutation(() => PaymentInformation, {
    name: 'deletePaymentInformation',
    description: 'Deletes a payment information by id',
  })
  deletePaymentInformation(
    @Args('id', {
      type: () => UUID,
      description: 'UUID of payment information to delete',
    })
    id: string,
  ) {
    return this.paymentInformationService.delete(id);
  }

  @Mutation(() => PaymentInformation, {
    name: 'deleteUserPaymentInformation',
    description: 'Deletes a payment information by id of an user',
  })
  deleteUserPaymentInformation(
    @Args('id', {
      type: () => UUID,
      description: 'UUID of payment information to delete',
    })
    @CurrentUser()
    user: User,
    id: string,
  ) {
    return this.paymentInformationService.deleteUsersPaymentInformation(
      id,
      user,
    );
  }
}
