import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveReference,
  Info,
} from '@nestjs/graphql';
import { PaymentService } from './payment.service';
import { Payment } from './entities/payment.entity';
import { PaymentConnection } from 'src/graphql-types/payment.connection';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { Logger } from '@nestjs/common';
import { FindPaymentArgs } from './dto/find-payments.dto';
import { queryKeys } from 'src/shared/utils/query.info.utils';
import { UUID } from 'src/shared/scalars/CustomUuidScalar';

@Resolver(() => Payment)
export class PaymentResolver {
  constructor(
    private readonly paymentService: PaymentService,
    // initialize logger with resolver context
    private readonly logger: Logger,
  ) {}

  @Roles(Role.SITE_ADMIN, Role.EMPLOYEE)
  @Query(() => PaymentConnection, {
    description: 'Retrieves all payments',
    name: 'payments',
  })
  findAll(@Args() args: FindPaymentArgs, @Info() info) {
    this.logger.log(`Resolving payments for ${JSON.stringify(args)}`);

    // get query keys to avoid unnecessary workload
    const query = queryKeys(info);

    return this.paymentService.buildConnection(query, args);
  }

  @Roles(Role.SITE_ADMIN)
  @Mutation(() => Payment, {
    name: 'deletePayment',
    description: 'Deletes a payment by id',
  })
  deletePayment(
    @Args('id', {
      type: () => UUID,
      description: 'UUID of payment to delete',
    })
    id: string,
  ) {
    this.logger.log(`Resolving deletePayment for ${id}`);
    return this.paymentService.delete(id);
  }

  /**
   * Resolves a reference to a Payment object.
   * @param reference - The reference object containing the typename and id.
   * @returns A Promise that resolves to a Payment object.
   */
  @ResolveReference()
  resolveReference(reference: {
    __typename: string;
    id: string;
  }): Promise<Payment> {
    this.logger.log(`Resolving reference for ${reference.id}`);

    return this.paymentService.findById(reference.id);
  }
}
