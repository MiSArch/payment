import { ObjectType } from '@nestjs/graphql';
import { Paginated } from '../shared/utils/pagination.utils';
import { PaymentInformation } from 'src/payment-information/entities/payment-information.entity';

@ObjectType({ description: 'A connection of payment informations' })
export class PaymentInformationConnection extends Paginated(
  PaymentInformation,
) {}
