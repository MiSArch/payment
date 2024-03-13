import { Module } from '@nestjs/common';
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
import { RolesGuard } from './shared/guards/roles.guard';
import { HealthModule } from './health/health.module';

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
      context: ({ req }) => ({ request: req }),
    }),
    PaymentModule,
    // For data persistence
    MongooseModule.forRoot(process.env.DATABASE_URI, {
      dbName: process.env.DATABASE_NAME,
    }),
    PaymentInformationModule,
    HealthModule,
  ],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
