import { InputType, Field } from '@nestjs/graphql';
import { IsCreditCard } from 'class-validator';
import { IsExpirationDate } from 'src/shared/validators/expiration-date.validator';

@InputType({ description: 'All required informations to save an credit card' })
export class CreateCCInformationInput {
  @Field(() => String, {
    description: 'The card holders name',
  })
  cardHolder: string;

  @Field(() => String, {
    description: 'The credit cards number',
  })
  @IsCreditCard({ message: 'The credit card number is invalid' })
  // all credit cards consist of 16 numbers
  cardNumber: string;

  @Field(() => String, {
    description: 'The credit cards expiration date',
  })
  @IsExpirationDate()
  // all credit cards consist of 16 numbers
  exirationDate: string;
}
