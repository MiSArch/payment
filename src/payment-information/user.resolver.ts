import { Resolver, ResolveField, Parent, Info } from '@nestjs/graphql';
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

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly paymentInforamtionService: PaymentInformationService,
    private readonly logger: Logger,
  ) {}

  @Roles(Role.EMPLOYEE, Role.SITE_ADMIN, Role.BUYER)
  @ResolveField(() => PaymentInformationConnection, {
    description: 'A connection for an users payment informations.',
    nullable: true,
  })
  async paymentInformations(
    @Parent() user: User,
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
        `{paymentInformations} User %${currentUser.id} not authorized to view payment informations for user %${user.id}`,
      );
      // throw not found error if the user is not authorized to access the payment information
      throw new UnauthorizedException(
        `User not authorized to access foreign Payment Informations}`,
      );
    }

    // get query keys to avoid unnecessary workload
    const query = queryKeys(info);
    // build default FindPaymentInformationArgs
    const args = new FindPaymentInformationsArgs();
    // filter for correct user
    args.filter = { user: user.id };

    return this.paymentInforamtionService.buildConnection(query, args);
  }
}
