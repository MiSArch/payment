import { Logger, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';
import { PaymentModule } from './payment/payment.module';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { UUID } from './shared/scalars/CustomUuidScalar';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentInformationModule } from './payment-information/payment-information.module';

@Module({
  imports: [
    // For Configuration from environment variables
    ConfigModule.forRoot({ isGlobal: true }),
    // For GraphQL Federation v2
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      resolvers: { UUID: UUID },
      autoSchemaFile: {
        federation: 2,
      },
    }),
    PaymentModule,
    // For data persistence
    MongooseModule.forRoot('mongodb://localhost:27017', {
      dbName: process.env.DATABASE_NAME,
    }),
    PaymentInformationModule,
  ],
  providers: [Logger],
})
export class AppModule {}
