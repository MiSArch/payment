import { Resolver, ResolveField, Parent, Info, Args } from '@nestjs/graphql';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { User } from 'src/graphql-types/user.entity';
import { PaymentInformationService } from './payment-information.service';
import { PaymentInformationConnection } from 'src/graphql-types/payment-information.connection.dto';
import { queryKeys } from 'src/shared/utils/query.info.utils';
import { FindPaymentInformationsArgs } from './dto/find-payment-informations.args';
import { CurrentUserRoles } from 'src/shared/utils/user-roles.decorator';
import { CurrentUser } from 'src/shared/utils/user.decorator';

/**
 * Resolver for Foreign User objects.
 */
@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly paymentInformationService: PaymentInformationService,
    private readonly logger: Logger,
  ) {}

  @ResolveField(() => PaymentInformationConnection, {
    description: 'A connection for an users payment informations.',
    nullable: true,
  })
  @Roles(Role.BUYER, Role.SITE_ADMIN, Role.EMPLOYEE)
  async paymentInformations(
    @Parent() user: User,
    @Args() args: FindPaymentInformationsArgs,
    @Info() info,
    @CurrentUser() currentUser: User,
    @CurrentUserRoles() roles: Role[],
  ): Promise<PaymentInformationConnection> {
    this.logger.log(`Resolving Payment Informations for User: ${user.id}`);

    // roles authorized to access foreign payment information
    const authorizedRoles = [Role.EMPLOYEE, Role.SITE_ADMIN];

    // check if user is authorized to view payment informations
    if (
      !roles.some((role) => authorizedRoles.includes(role)) &&
      currentUser.id.toString() !== user.id.toString()
    ) {
      this.logger.debug(
        `{paymentInformations} User ${currentUser.id} not authorized to view payment informations for user ${user.id}`,
      );
      // throw not found error if the user is not authorized to access the payment information
      throw new UnauthorizedException(
        `User not authorized to access foreign Payment Informations}`,
      );
    }

    // get query keys to avoid unnecessary workload
    const query = queryKeys(info);
    // filter for correct user
    const filter = { ...args.filter, user: { id: user.id } };

    return this.paymentInformationService.buildConnection(query, {
      ...args,
      filter,
    });
  }
}
