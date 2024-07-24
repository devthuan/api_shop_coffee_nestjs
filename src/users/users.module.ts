import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthService } from 'src/auth/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/users.entity';
import { UserInformation } from './entities/user_infomation.entity';
import { UserHasRoles } from 'src/auth/entities/user_has_roles.entity';
import { Roles } from 'src/auth/entities/roles.entity';
import { EmailService } from 'src/email/email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, UserInformation, UserHasRoles, Roles])
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
