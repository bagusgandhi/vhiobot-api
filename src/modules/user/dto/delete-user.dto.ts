import { IsNotEmpty, IsString } from 'class-validator';
// import { ApiProperty } from '@nestjs/swagger';

export class DeleteUserDto {
    // @ApiProperty({ example: "499e49dd-ebf3-4c6a-a020-a118163e7c9c" })
    @IsNotEmpty()
    @IsString()
    uuid: string;
}