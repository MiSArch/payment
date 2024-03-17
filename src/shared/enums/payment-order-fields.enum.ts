import { registerEnumType } from '@nestjs/graphql';

export enum PaymentOrderField {
  // Order Product Items by their ID
  ID = '_id',
}

registerEnumType(PaymentOrderField, {
  name: 'PaymentOrderField',
  description: 'The field to order Payments by',
  valuesMap: {
    ID: {
      description: 'Order Payments by their ID',
    },
  },
});
