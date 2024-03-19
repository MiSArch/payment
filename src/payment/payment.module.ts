import { Logger, Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentResolver } from './payment.resolver';
import { PaymentInformationModule } from 'src/payment-information/payment-information.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './entities/payment.entity';
import { PaymentProviderConnectionModule } from 'src/payment-provider-connection/payment-provider-connection.module';
import { EventModule } from 'src/events/event.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    PaymentInformationModule,
    EventModule,
    PaymentProviderConnectionModule,
  ],
  providers: [PaymentResolver, PaymentService, Logger],
  exports: [PaymentService],
})
export class PaymentModule {}
