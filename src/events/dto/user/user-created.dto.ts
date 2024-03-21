import { IsString, IsUUID } from 'class-validator';

/**
 * DTO for a creation of a new user.
 * @property if - The id of the user.
 * @property username - The username of the user.
 * @property firstName - The first name of the user.
 * @property lastName - The last name of the user.
 * @property dateJoined - The date the user joined.
 */
export class UserCreatedDto {
  @IsUUID()
  id: string;
  @IsString()
  username: string;
  @IsString()
  firstName: string;
  @IsString()
  lastName: string;
  @IsString()
  dateJoined: string;
}
