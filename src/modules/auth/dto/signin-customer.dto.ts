import { IsNotEmpty, IsString, IsEmail } from "class-validator";
// import { ApiProperty } from "@nestjs/swagger";

export class SignInCustomerDto {
    // @ApiProperty({ example: "myusername" })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    // @ApiProperty({ example: "mypaswrd" })
    @IsNotEmpty()
    @IsString()
    name: string;
}