import { registerEnumType } from '@nestjs/graphql';

export enum PaymentInformationOrderField {
  // Order Product Items by their ID
  ID = '_id',
}

registerEnumType(PaymentInformationOrderField, {
  name: 'ProductItemOrderField',
  description: 'The field to order Product Items by',
  valuesMap: {
    ID: {
      description: 'Order Product Items by their ID',
    },
  },
});
