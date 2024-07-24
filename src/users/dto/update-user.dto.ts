import { PartialType } from '@nestjs/mapped-types';
import { IsDate, IsDateString, IsIn, IsNumber, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {

    @IsOptional()
    @IsString()
    firstName?: string

    @IsOptional()
    @IsString()
    lastName?: string

    @IsOptional()
    @IsString()
    @IsIn(['male', 'female', 'other'])
    gender?: string

    @IsOptional()
    @IsPhoneNumber()
    phoneNumber?: string

    @IsOptional()
    @IsString()
    avatar?: string

    @IsOptional()
    @IsDate()
    @Type(() => Date)  
    dateOfBirth?: Date

    @IsOptional()
    @IsString()
    address1?: string

    @IsOptional()
    @IsString()
    address2?: string
}
