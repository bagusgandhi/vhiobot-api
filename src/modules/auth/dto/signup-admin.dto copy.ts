import { IsNotEmpty, IsString, IsEmail } from "class-validator";
// import { ApiProperty } from "@nestjs/swagger";

export class SignUpAdminDto {
    // @ApiProperty({ example: "myusername" })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    // @ApiProperty({ example: "mypaswrd" })
    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsString()
    name: string;
}