import { registerEnumType } from '@nestjs/graphql';

// Enum for the supported payment methods
export enum PaymentMethod {
  // The user pays after ordering the product
  INVOICE = 'INVOICE',
  // The user pays before the product is shipped
  PREPAYMENT = 'PREPAYMENT',
  // The item has been shipped to the customer
  CREDIT_CARD = 'CREDIT_CARD',
}

// Register the enum with NestJS GraphQL
registerEnumType(PaymentMethod, {
  name: 'PaymentMethod',
  description: 'The supported payment methods',
  valuesMap: {
    INVOICE: {
      description: 'The user pays after ordering the product',
    },
    PREPAYMENT: {
      description: 'The user pays before the product is shipped',
    },
    CREDIT_CARD: {
      description: 'The amount is charged to the users credit card',
    },
  },
});
