import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveReference,
  ResolveField,
  Info,
  Parent,
} from '@nestjs/graphql';
import { PaymentInformationService } from './payment-information.service';
import { PaymentInformation } from './entities/payment-information.entity';
import { CreateCreditCardInformationInput } from './dto/create-creadit-card-information.input';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { UUID } from 'src/shared/scalars/CustomUuidScalar';
import { CurrentUser } from 'src/shared/utils/user.decorator';
import { User } from 'src/graphql-types/user.entity';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { CurrentUserRoles } from 'src/shared/utils/user-roles.decorator';
import { FindPaymentInformationsArgs } from './dto/find-payment-informations.args';
import { queryKeys } from 'src/shared/utils/query.info.utils';
import { PaymentInformationConnection } from 'src/graphql-types/payment-information.connection.dto';
import { FindPaymentArgs } from 'src/payment/dto/find-payments.dto';
import { PaymentService } from 'src/payment/payment.service';
import { PaymentConnection } from 'src/graphql-types/payment.connection';
import { PaymentFilter } from 'src/payment/dto/filter-payment.input';

/**
 * Resolver for PaymentInformation objects.
 */
@Resolver(() => PaymentInformation)
export class PaymentInformationResolver {
  constructor(
    private readonly paymentInformationService: PaymentInformationService,
    private readonly paymentService: PaymentService,
    // initialize logger with resolver context
    private readonly logger: Logger,
  ) {}

  @Roles(Role.BUYER)
  @Mutation(() => PaymentInformation, {
    name: 'createCreditCardPaymentInformation',
    description: 'Adds a credit card to the users stored payment informations',
  })
  createCreditCardPaymentInformation(
    @Args('input') input: CreateCreditCardInformationInput,
    @CurrentUser() user: User,
  ) {
    this.logger.log(
      `Resolving createCreditCardPaymentInformation for ${user.id} with input ${JSON.stringify(input)}`,
    );
    return this.paymentInformationService.createCreditCardInformation(
      input,
      user,
    );
  }

  @Roles(Role.SITE_ADMIN, Role.EMPLOYEE)
  @Query(() => PaymentInformationConnection, {
    name: 'paymentInformations',
    description: ' Retrieves all payment informations matching the filter',
  })
  find(
    @Args() args: FindPaymentInformationsArgs,
    @Info() info,
  ): Promise<PaymentInformationConnection> {
    this.logger.log(
      `Resolving paymentInformations for ${JSON.stringify(args)}`,
    );
    // get query keys to avoid unnecessary workload
    const query = queryKeys(info);

    return this.paymentInformationService.buildConnection(query, args);
  }

  @Roles(Role.SITE_ADMIN, Role.EMPLOYEE, Role.BUYER)
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
    @CurrentUser()
    user: User,
    @CurrentUserRoles()
    roles: Role[],
  ) {
    this.logger.log(`Resolving deletePaymentInformation for id ${id}`);
    return this.paymentInformationService.delete(id, user, roles);
  }

  /**
   * Resolves a reference to a PaymentInformation object.
   * @param reference - The reference object containing the typename and id.
   * @returns A Promise that resolves to a PaymentInformation object.
   */
  @ResolveReference()
  resolveReference(reference: {
    __typename: string;
    id: string;
  }): Promise<PaymentInformation> {
    this.logger.log(`Resolving reference for ${reference.id}`);

    return this.paymentInformationService.findById(reference.id);
  }

  /**
   * Resolves the user for the given payment information.
   * @param paymentInformation The payment information object.
   * @returns The user object.
   */
  @ResolveField()
  user(@Parent() paymentInformation: PaymentInformation) {
    this.logger.log(`Resolving user for ${paymentInformation}`);

    return { __typename: 'User', id: paymentInformation.user.id };
  }

  @ResolveField(() => PaymentConnection, {
    description:
      'A connection for an users payments made with a payment information.',
    nullable: true,
  })
  @Roles(Role.BUYER, Role.SITE_ADMIN, Role.EMPLOYEE)
  async payments(
    @Parent() paymentInformation: PaymentInformation,
    @Args() args: FindPaymentArgs,
    @Info() info,
    @CurrentUser() currentUser: User,
    @CurrentUserRoles() roles: Role[],
  ): Promise<PaymentConnection> {
    this.logger.log(
      `Resolving Payments for Payment Information: ${paymentInformation.id}`,
    );
    const { user } = paymentInformation;
    // roles authorized to access foreign payments
    const authorizedRoles = [Role.EMPLOYEE, Role.SITE_ADMIN];

    // check if user is authorized to view payments
    if (
      !roles.some((role) => authorizedRoles.includes(role)) &&
      currentUser.id.toString() !== user.id.toString()
    ) {
      this.logger.debug(
        `{payments} User ${currentUser.id} not authorized to view payments for user %${user.id}`,
      );
      // throw not found error if the user is not authorized to access the payment information
      throw new UnauthorizedException(
        `User not authorized to access foreign Payments}`,
      );
    }

    // get query keys to avoid unnecessary workload
    const query = queryKeys(info);
    // extend filter to retrieve associated payments for payment information
    const filter: PaymentFilter = {
      ...args.filter,
      paymentInformationId: paymentInformation.id,
    };

    return this.paymentService.buildConnection(query, { ...args, filter });
  }
}
