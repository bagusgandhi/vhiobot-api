import { IsDateString, IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { Transform, Type } from 'class-transformer';
// import { ApiProperty } from "@nestjs/swagger";

export class GetAnalticsDto {
  @IsOptional()
  @IsEnum(['daily', 'monthly'])
  period: 'daily' | 'monthly';

  // @IsDateString({}, { message: 'dateStart must be a valid date string' })
  @IsNotEmpty()
  dateStart: string;

  // @IsDateString({}, { message: 'dateEnd must be a valid date string' })
  @IsNotEmpty()
  dateEnd: string;
}