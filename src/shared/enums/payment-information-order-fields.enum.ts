import { registerEnumType } from '@nestjs/graphql';

export enum PaymentInformationOrderField {
  // Order payment informations by their ID
  ID = '_id',
}

registerEnumType(PaymentInformationOrderField, {
  name: 'PaymentInformationOrderField',
  description: 'The field to order payment informations by',
  valuesMap: {
    ID: {
      description: 'Order payment informations by their id',
    },
  },
});
