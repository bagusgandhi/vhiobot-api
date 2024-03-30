import { IsNotEmpty, IsString, IsDate, IsOptional } from "class-validator";
// import { ApiProperty } from "@nestjs/swagger";

export class CreateChatDto {
    // @ApiProperty({ example: "myusername" })
    @IsOptional()
    @IsString()
    sender?: string;

    @IsNotEmpty()
    @IsString()
    text: string;

    // @ApiProperty({ example: "mypaswrd" })
    @IsNotEmpty()
    @IsDate()
    timestamp: Date;
}