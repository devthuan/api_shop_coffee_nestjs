import { IsEmail, IsIP, IsString, MinLength } from "class-validator";


export class VerifyOTPDto {

    @IsEmail()
    email: string;
    
    @IsString()
    otp: string;

  

}
