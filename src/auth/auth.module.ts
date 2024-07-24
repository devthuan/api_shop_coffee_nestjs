import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from 'src/users/users.service';
import { Users } from 'src/users/entities/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roles } from './entities/roles.entity';
import { Permissions } from './entities/permissions.entity';
import { UserHasRoles } from './entities/user_has_roles.entity';
import { UserHasPermissions } from './entities/user_has_permissions.entity';
import { EmailService } from 'src/email/email.service';
import { UserInformation } from 'src/users/entities/user_infomation.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { GoogleStrategy } from './strategy/google.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,

    }),
    JwtModule.register({
      global: true,
      secret: 'secret_password',
      signOptions: { expiresIn: '365d' },
    }),
    TypeOrmModule.forFeature([Users, Roles, Permissions, UserHasRoles, UserHasPermissions, UserInformation ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService, GoogleStrategy],
})
export class AuthModule {}
