import { registerEnumType } from '@nestjs/graphql';

// Enum for the current status of an payment
export enum PaymentStatus {
  // The payment was created but not yet processed
  OPEN = 'OPEN',
  // The payment is currently being processed
  PENDING = 'PENDING',
  // The payment was successfully processed
  SUCCEEDED = 'SUCCEEDED',
  // The payment processing failed indefinetely
  FAILED = 'FAILED',
  // The payment was sold to external inkasso service
  INKASSO = 'INKASSO',
}

// Register the enum with NestJS GraphQL
registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
  description: 'The status of an payment of an invoice or return',
  valuesMap: {
    OPEN: {
      description: 'The payment was created but not yet processed',
    },
    PENDING: {
      description: 'The payment is currently being processed',
    },
    SUCCEEDED: {
      description:
        'The payment was successfully processed and the amount was transfered',
    },
    FAILED: {
      description: 'The payment processing failed indefinetely',
    },
    INKASSO: {
      description: 'The payment was sold to external inkasso service',
    },
  },
});
