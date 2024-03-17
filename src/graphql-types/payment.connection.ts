import { ObjectType } from '@nestjs/graphql';
import { Paginated } from '../shared/utils/pagination.utils';
import { Payment } from 'src/payment/entities/payment.entity';

@ObjectType({ description: 'A connection of product items' })
export class PaymentConnection extends Paginated(Payment) {}
