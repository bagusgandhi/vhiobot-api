import { IsOptional, IsNumber } from "class-validator";
import { Transform, Type } from 'class-transformer';
// import { ApiProperty } from "@nestjs/swagger";

export class GetAllIntentDto {
    @Transform(({ value }) => value === undefined ? 1 : Number(value))
    @IsOptional()
    @IsNumber()
    page?: number = 1;

    @Transform(({ value }) => value === undefined ? 10 : Number(value))
    @IsOptional()
    @IsNumber()
    limit?: number = 10;
}