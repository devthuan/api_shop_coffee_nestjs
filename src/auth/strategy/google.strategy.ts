import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    
  ) {

    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:8080/api/v1/auth/google/callback',
      scope: ['email', 'profile'],
    });
    
  }

  

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const {id, name, emails, photos, provider } = profile;
    const user = {
        provider:  provider,
        id_google: id,  
        email: emails[0].value,
        firstName: name.givenName,
        lastName: name.familyName, 
        picture: photos[0].value,
        accessToken,
    };
    console.log(user)
    done(null, user);
  }
}
