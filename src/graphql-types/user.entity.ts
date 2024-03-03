import { ObjectType, Field, Directive } from '@nestjs/graphql';
import { UUID } from 'src/shared/scalars/CustomUuidScalar';

@ObjectType({ description: 'Foreign type User' })
@Directive('@key(fields: "id")')
export class User {
  @Field(() => UUID, {
    description: 'The uuid identifier of the user',
  })
  id: string;
}
