import { IsEmail, IsIP, IsString, MinLength } from "class-validator";


export class ChangePasswordDto {

    @IsEmail()
    email: string;

    @IsString()
    oldPassword: string;

    @IsString()
    @MinLength(5)
    newPassword: string;

  

}
