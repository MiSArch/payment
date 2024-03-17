import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveReference,
  Info,
} from '@nestjs/graphql';
import { PaymentInformationService } from './payment-information.service';
import { PaymentInformation } from './entities/payment-information.entity';
import { CreateCreditCardInformationInput } from './dto/create-creadit-card-information.input';
import { Logger } from '@nestjs/common';
import { UUID } from 'src/shared/scalars/CustomUuidScalar';
import { CurrentUser } from 'src/shared/utils/user.decorator';
import { User } from 'src/graphql-types/user.entity';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { CurrentUserRoles } from 'src/shared/utils/user-roles.decorator';
import { FindPaymentInformationsArgs } from './dto/find-payment-informations.args';
import { queryKeys } from 'src/shared/utils/query.info.utils';
import { PaymentInformationConnection } from 'src/graphql-types/payment-information.connection.dto';

@Resolver(() => PaymentInformation)
export class PaymentInformationResolver {
  constructor(
    private readonly paymentInformationService: PaymentInformationService,
    // initialize logger with resolver content
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
    description: ' Retrieves all payment informations matching the fitler',
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
  @Roles(Role.SITE_ADMIN, Role.EMPLOYEE, Role.BUYER)
  @ResolveReference()
  resolveReference(reference: {
    __typename: string;
    id: string;
  }): Promise<PaymentInformation> {
    this.logger.log(`Resolving reference for ${reference.id}`);

    return this.paymentInformationService.findById(reference.id);
  }
}
