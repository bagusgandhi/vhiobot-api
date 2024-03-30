import { IsNotEmpty, IsString, IsEmail } from "class-validator";
// import { ApiProperty } from "@nestjs/swagger";

export class SignInAdminDto {
    // @ApiProperty({ example: "myusername" })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    // @ApiProperty({ example: "mypaswrd" })
    @IsNotEmpty()
    @IsString()
    password: string;
}