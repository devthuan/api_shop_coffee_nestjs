import { IsEmail, IsIP, IsString } from "class-validator";


export class CreateUserDto {

    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsIP()
    ip: string;

}
