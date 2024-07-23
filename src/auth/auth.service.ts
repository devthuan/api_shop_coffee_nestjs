import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {




    async hashingPassword(password: string): Promise<string> {
        let salt : number = 10;
        let hashedPassword : string = await bcrypt.hash(password, salt);
        return hashedPassword;
    }

    async verifyPassword(originPassword: string, hashPassword: string): Promise<boolean> {
       return await bcrypt.compare(originPassword, hashPassword);
        
    }

    generateOTP() {
        let otp = Math.floor(100000 + Math.random() * 900000);
        return otp;
    }

    

}
