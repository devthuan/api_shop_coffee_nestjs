import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {

    @IsString()
    firstName?: string

    @IsString()
    lastName?: string

    @IsString()
    gender?: string

    @IsString()
    phoneNumber?: string

    @IsString()
    avatar?: string

    @IsString()
    dateOfBirth?: string

    @IsString()
    address1?: string

    @IsString()
    address2?: string
}
