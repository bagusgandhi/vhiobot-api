import { IsNotEmpty, IsString, IsArray, ArrayMinSize } from "class-validator";
// import { ApiProperty } from "@nestjs/swagger";

export class CreateIntentDto {
    // @ApiProperty({ example: "myusername" })
    @IsNotEmpty()
    @IsString()
    displayName: string;
    
    @IsArray()
    @IsString({ each: true })
    trainingPhrasesParts: string[];

    @IsArray()
    @IsString({ each: true })
    messageTexts: string[];
}