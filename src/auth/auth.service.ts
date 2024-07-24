import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/users/entities/users.entity';
import { UserInformation } from 'src/users/entities/user_infomation.entity';
import { Roles } from './entities/roles.entity';
import { UserHasRoles } from './entities/user_has_roles.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { EmailService } from 'src/email/email.service';
import { EmailDto } from './dto/email.dto';
import { VerifyOTPDto } from './dto/verifyOTP.dto';
import { DEFAULT_CIPHERS } from 'tls';
import { JwtService } from '@nestjs/jwt';
import { LoginGoogle } from './auth.interface';

@Injectable()
export class AuthService {

    constructor(
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,

        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
        @InjectRepository(UserInformation)
        private readonly usersInformationRepository: Repository<UserInformation>,
        @InjectRepository(Roles)
        private readonly rolesRepository: Repository<Roles>,
        @InjectRepository(UserHasRoles)
        private readonly userHasRolesRepository: Repository<UserHasRoles>,


        private readonly dataSource: DataSource,
        private readonly emailService: EmailService,
        private readonly jwtService: JwtService
    ){}

    async register(createUserDto: CreateUserDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect()
        await queryRunner.startTransaction();
        try {

        // init user
        const newUser = this.usersRepository.create({
            email: createUserDto.email,
            password: await this.hashingPassword(createUserDto.password),
            ip: createUserDto.ip,
            balance: 0,
            typeLogin: "system",
            isActive: false,
            lastLogin: new Date(),
        })
        await queryRunner.manager.save(newUser)

        // init user information
        const userInformation = this.usersInformationRepository.create({
            user: newUser,
        })
        await queryRunner.manager.save(userInformation)

        // init role 
        const role = await this.rolesRepository.findOne({where: {name: "admin"}  })
        if (!role) {
            throw new Error("Role not found")
        }
        const userRole = this.userHasRolesRepository.create({
            user: newUser,
            role: role,
            isActivate: true,
        })
        await queryRunner.manager.save(userRole)

        

        // generate otp
        const otp   = this.generateOTP();
        const otpHash = await this.hashingPassword(otp.toString())

        // save otp to redis
        await this.cacheManager.set(newUser.email, otpHash); 

        // send email
        await this.emailService.sendEmail(
            newUser.email,
            "Mã OTP",
            otp.toString(),
            otp.toString()
        )


        await queryRunner.commitTransaction();

        return {
            statusCode: 200,
            status: 'success',
            message: 'Create user success',
        }

        } catch (error) {
        await queryRunner.rollbackTransaction();
        if (error.code === 'ER_DUP_ENTRY') {
            return {
            statusCode: 400,
            status: 'error',
            message: 'Email or number phone already exists',
            }
        }else {

            throw error;
        }
        } finally {
        await queryRunner.release();
        }
    }

    async login(createUserDto: CreateUserDto) : Promise<any> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect()
        await queryRunner.startTransaction();
        try {

            const user = await this.dataSource
            .getRepository(Users)
            .createQueryBuilder('users')
            .leftJoinAndSelect('users.userHasRole', 'userHasRole')
            .leftJoinAndSelect('userHasRole.role', 'roles') 
            .leftJoinAndSelect('users.userHasPermission', 'userHasPermission')
            .where('users.email = :email', { email: createUserDto.email })
            .andWhere('users.deletedAt IS NULL')
            .getOne();

            if (!user) {
                 return {
                    statusCode: 401,
                    status: "error",
                    message: "Your account does not exist."
                }
            }

            if(user.isActive === false) {
                return {
                statusCode: 401,
                status: "error",
                message: "Account is not active or blocked."
                }
            }
            
            const isMatch = await this.verifyPassword(createUserDto.password, user.password);
            if (!isMatch) {
                return {
                    statusCode: 401,
                    status: "error",
                    message: "Incorrect password."
                }
            }else {
                const payload = {
                    id: user.id,
                    email: user.email,
                    roles: user.userHasRole.map(r => r.role.name),
                    permissions: user.userHasPermission.map(p => p.permission.name),
                }

                const token = await this.jwtService.signAsync(payload)
    
                user.lastLogin = new Date();
                user.ip = createUserDto.ip
                await this.usersRepository.save(user);
                
                await queryRunner.commitTransaction();
                return {
                    statusCode: 200,
                    status: "success",
                    message: "Login successful",
                    token: token
                } 
            }

        } catch (error) {
            console.log(error)
            throw new Error(error)
        }
    }

    async loginWithGoogle(infoUser : LoginGoogle) : Promise<any> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect()
        await queryRunner.startTransaction();
        try {
            const userExists = await this.getInfoUserByEmail(infoUser.email)

           
            if (userExists) {
                if(userExists.typeLogin === "system") {
                    return {
                        statusCode: 401,
                        status: "error",
                        message: "Your account is registered as a system account."
                    }
                }
           
                const payload = {
                    id: userExists.id,
                    email: userExists.email,
                    roles: userExists.userHasRole.map(r => r.role.name),
                    permissions: userExists.userHasPermission.map(p => p.permission.name),
                }
                const token = await this.jwtService.signAsync(payload)
                userExists.lastLogin = new Date();
                userExists.ip = '0.0.0.0'
                await queryRunner.manager.save(userExists);

                await queryRunner.commitTransaction();

                return {
                    statusCode: 200,
                    status: "success",
                    message: "Login successful",
                    token: token
                }
            
            }else {

                // init user
                const newUser : Users = this.usersRepository.create({
                    email: infoUser.email,
                    password: await this.hashingPassword("secret_password_google"),
                    ip: '0.0.0.0',
                    balance: 0,
                    typeLogin: "google",
                    isActive: true,
                    lastLogin: new Date(),
                })
                await queryRunner.manager.save(newUser)

                // init user information
                const newUserInfo : UserInformation = this.usersInformationRepository.create({
                    user: newUser,
                    firstName: infoUser.firstName,
                    lastName: infoUser.lastName,
                    avatar: infoUser.picture,
                })
                await queryRunner.manager.save(newUserInfo)
                
                // init role
                const role : Roles = await this.rolesRepository.findOne({where: {name: "client"}  })
                if (!role) {
                    throw new Error("Role not found")
                }
                const userRole : UserHasRoles = this.userHasRolesRepository.create({
                    user: newUser,
                    role: role,
                    isActivate: true,
                })
                 await queryRunner.manager.save(userRole)

                // create token
            
                const payload = {
                    id: newUser.id,
                    email: newUser.email,
                    roles: role.name,
                    // permissions: user.userHasPermission.map(p => p.permission.name),
                }


                await queryRunner.manager.save(newUser);

                await queryRunner.commitTransaction();

                return {
                    statusCode: 200,
                    status: "success",
                    message: "Login successful",
                    token: await this.jwtService.signAsync(payload)
                }
            }

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new Error(error)
        }finally {
            await queryRunner.release();
        }
    }

    async changePassword(email: string, oldPassword: string, newPassword: string){
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user) {
        throw new NotFoundException('User not found');
        }

        const isMatch = await this.verifyPassword(oldPassword, user.password);
        if (!isMatch) {
        return {
            statusCode: 401,
            status: "error",
            message: "Incorrect password."
        }
        }
        user.password = await this.hashingPassword(newPassword);
        user.updatedAt = new Date();
        await this.usersRepository.save(user);
        return {
            statusCode: 200,
            status:'success',
            message: 'Change password successful',
        }
    }

    async forgotPassword(email: string) {
        const user : Users = await this.usersRepository.findOne({where : { email: email }});
        if (!user) {
        return {
            statusCode: 404,
            status: 'error',
            message: 'Account not found.',
        }
        }
        const newPassword : string =  this.generatePassword();
        await this.emailService.sendEmail(
            user.email,
            'your new Password',
            newPassword,
            newPassword,
        )  

        user.password = await this.hashingPassword(newPassword);
        user.updatedAt = new Date();
        await this.usersRepository.save(user);

        return {
            statusCode: 200,
            status:'success',
            message: 'New password sent to your email.',
        }

    }

    async verifyOTP(email : string, otp : string) : Promise<any> {
       try {
            const otpCache : string = await this.cacheManager.get(email)

            if(!otpCache) {
                return {
                statusCode: 400,
                status: "fail",
                message: "OTP is not found.",
                };
            }
            const checkOTP = await this.verifyPassword(otp,otpCache)
            if(!checkOTP) {
                return {
                statusCode: 400,
                status: "fail",
                message: "OTP is not correct"
                };
            }

            const user = await this.usersRepository.findOne({
                where: {
                    email: email,
                    deletedAt:  null
                }
            })

            if(!user) {
                return {
                statusCode: 400,
                status: "fail",
                message: "Email is not found."
                };
            }
            user.isActive = true
            user.updatedAt = new Date()
            await this.usersRepository.save(user)
            

            await this.cacheManager.del(email)
            return {
                statusCode: 200,
                status: "success",
                message: "Account is verified successfully."
            };
       } catch (error) {
            console.log(error)
            throw new Error(error)    
       }
    }

    async sendOTP(email: string) : Promise<any>{
        try {
            const cachedData = await this.cacheManager.get(email);
            if (cachedData) {
                
                return {
                    statusCode: 429,
                    status: "error",
                    message: "You can only request a new OTP every 3 minutes",
                };
            }

            const otp : number = this.generateOTP();
            const hashedOTP : string = await this.hashingPassword(otp.toString());
            await this.cacheManager.set(email, hashedOTP);
          
            await this.emailService.sendEmail(
                email,
                "Mã OTP đăng ký tài khoản",
                otp.toString(),
                otp.toString()
            )
            return {
                statusCode: 200,
                status: "success",
                message: "OTP sent successfully"
            };
            
        } catch (error) {
            console.log(error)
            throw new Error(error)
        }
    }

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

    generatePassword(): string {
        const password = Math.random().toString(36).substr(2, 10);
        return password;
    }


    async getInfoUserByEmail(email : string): Promise<any> {
        const user = await this.dataSource
            .getRepository(Users)
            .createQueryBuilder('users')
            .leftJoinAndSelect('users.userHasRole', 'userHasRole')
            .leftJoinAndSelect('userHasRole.role', 'roles') 
            .leftJoinAndSelect('users.userHasPermission', 'userHasPermission')
            .where('users.email = :email', { email })
            .andWhere('users.deletedAt IS NULL')
            .getOne();
        
        if (!user) {
           return null;
        }
    
        return user        
    }

    

}
