import { IsNotEmpty, IsString, IsEmail, MinLength, IsEnum } from 'class-validator';
import { Role } from 'src/modules/auth/enum/roles.enum';
// import { ApiProperty } from '@nestjs/swagger';
// import { Role } from 'src/services/auth/roles/roles.enum';
// import { UserStatus } from '../constants';

export class CreateUserCUstomerDto {
  // @ApiProperty({ example: "john@example.com" })
  @IsNotEmpty()
  @IsEmail()
  email: string;
  
  // @ApiProperty({ example: "itsjohndoe" })
  @IsNotEmpty()
  @IsString()
  name: string;

  // @ApiProperty({ example: "ADMINISTRATOR" })
  @IsNotEmpty()
  @IsEnum(Role, {
    message: `role must be fit with list of roles that provided`,
  })
  role: Role

}