import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveReference,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { PaymentInformationService } from './payment-information.service';
import { PaymentInformation } from './entities/payment-information.entity';
import { CreateCCInformationInput } from './dto/create-creadit-card-information.input';
import { Logger } from '@nestjs/common';
import { UUID } from 'src/shared/scalars/CustomUuidScalar';
import { CurrentUser } from 'src/shared/utils/user.decorator';
import { User } from 'src/graphql-types/user.entity';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { UserPaymentInformation } from './entities/user-payment-information.entity';

@Resolver(() => PaymentInformation)
export class PaymentInformationResolver {
  constructor(
    private readonly paymentInformationService: PaymentInformationService,
    // initialize logger with resolver content
    private readonly logger: Logger,
  ) {}

  @Query(() => Boolean, {
    name: 'Healthcheck',
    description: 'Return true, if the service is healthy',
  })
  healthcheck() {
    return true;
  }

  @Roles(Role.BUYER)
  @Mutation(() => UserPaymentInformation, {
    name: 'createCreditCardPaymentInformation',
    description: 'Adds a credit card to the users stored payment informations',
  })
  createCCInformation(
    @Args('input') createCCInformationInput: CreateCCInformationInput,
    @CurrentUser() user: User,
  ) {
    this.logger.log(
      `Resolving createCreditCardPaymentInformation for ${user} with input ${createCCInformationInput}`,
    );
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
    this.logger.log(`Resolving paymentInformations`);
    return this.paymentInformationService.findAll();
  }

  @Roles(Role.BUYER)
  @Query(() => [UserPaymentInformation], {
    name: 'userPaymentInformations',
    description: ' Retrieves all payment informations of an user',
  })
  findUserPaymentInformation(@CurrentUser() user: User) {
    this.logger.log(`Resolving paymentInformations for user ${user}`);
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
    this.logger.log(`Resolving deletePaymentInformation for id ${id}`);
    return this.paymentInformationService.delete(id);
  }

  @Roles(Role.BUYER)
  @Mutation(() => UserPaymentInformation, {
    name: 'deleteUserPaymentInformation',
    description: 'Deletes a payment information by id of an user',
  })
  deleteUserPaymentInformation(
    @Args('id', {
      type: () => UUID,
      description: 'UUID of payment information to delete',
    })
    id: string,
    @CurrentUser()
    user: User,
  ) {
    this.logger.log(
      `Resolving deleteUserPaymentInformation for id ${id} of user ${user}`,
    );
    return this.paymentInformationService.deleteUsersPaymentInformation(
      id,
      user,
    );
  }

  @ResolveReference()
  resolveReference(reference: {
    __typename: string;
    id: string;
  }): Promise<PaymentInformation> {
    this.logger.log(`Resolving reference for ${reference.id}`);

    return this.paymentInformationService.findById(reference.id);
  }

  @ResolveField()
  user(@Parent() info: PaymentInformation) {
    this.logger.log(`Resolving user for ${info}`);

    return { __typename: 'User', id: info.user };
  }
}
