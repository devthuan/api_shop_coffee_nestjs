import { Inject, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository,  } from '@nestjs/typeorm';
import { Users } from './entities/users.entity';
import { DataSource, Not, Repository } from 'typeorm';
import { UserInformation } from './entities/user_infomation.entity';

import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';


@Injectable()
export class UsersService {

  constructor(

    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,

    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    
    @InjectRepository(UserInformation)
    private readonly usersInformationRepository: Repository<UserInformation>,
    
    private readonly dataSource: DataSource,

  ){}

 
  async findAll(page: number, limit: number, sortBy: string, sortOrder: string) {
    
    const queryBuilder = this.usersRepository.createQueryBuilder('users')

    const [result, total] = await queryBuilder
    .where('users.deletedAt IS NULL')
    .orderBy(`users.${sortBy}`, sortOrder as 'ASC' | 'DESC')
    .take(limit)
    .skip((page - 1) * limit)
    .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    const filteredUsers = result.map((user) => {
      delete user.password
      return user;
    })

    return {
      statusCode: 200,
      status:'success',
      message: 'Get users successful',
      total: total,
      totalPages: totalPages,
      currentPage: page,
      data: filteredUsers,
    }
  }

  async findAllDeleted(page: number, limit: number, sortBy : string, sortOrder : string ) {

    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    const [result, total] = await queryBuilder
      .where('user.deletedAt IS NOT NULL')
      .orderBy(`user.${sortBy}`, sortOrder as 'ASC' | 'DESC')
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();
      

    const totalPages = Math.ceil(total / limit);

    let filteredUsers = result.map((user) => {
      delete user.password
      return user;
    })

    return {
      statusCode: 200,
      status:'success',
      message: 'Get users deleted successful',
      total: total,
      totalPages: totalPages,
      currentPage: page,
      data: filteredUsers,
    }
  }

  async findOneById(id: string): Promise<any> {

    const user = await this.dataSource
     .getRepository(Users)
     .createQueryBuilder('users')
     .leftJoinAndSelect('users.userHasRole', 'userHasRole')
     .leftJoinAndSelect('userHasRole.role', 'roles') 
     .leftJoinAndSelect('users.userHasPermission', 'userHasPermission')
     .where('users.id = :id', { id })
     .andWhere('users.deletedAt IS NULL')
     .getOne();
    
    if (!user) {
      return {
        statusCode: 404,
        status: 'error',
        message: 'User not found',
      }
    }
    delete user.password
    return user; 
  }
  async findOneByEmail(email: string): Promise<any> {

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
      return {
        statusCode: 404,
        status: 'error',
        message: 'User not found',
      }
    }
    delete user.password
    return user; 
  }

  async searchByEmail(email : string, page: number, limit: number,sortBy : string, sortOrder : string ) {
    
    const queryBuilder = this.usersRepository.createQueryBuilder('user');
    const [result, total] = await queryBuilder
      .where(
          `user.email LIKE :email && user.deletedAt IS NULL`, { email: `${email}%` }

      )
      .orderBy(`user.${sortBy}`, sortOrder as 'ASC' | 'DESC')
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();
      

    const totalPages = Math.ceil(total / limit);

    let filteredUsers = result.map((user) => {
      delete user.password
      return user;
    })

    return {
      statusCode: 200,
      status:'success',
      message: 'Get users successful',
      total: total,
      totalPages: totalPages,
      data: filteredUsers,
    }
  }

  async update(id: string , updateUserDto: UpdateUserDto) {
    const user = await this.findOneById(id)
    if (!user) {
      return {
        statusCode: 404,
        status: 'error',
        message: 'User not found',
      }
    }
    const updated_user ={...updateUserDto, updatedAt: new Date()}
    const result = await this.usersInformationRepository.update({user: user}, updated_user);

    if (result.affected === 0) {
      return {
        statusCode: 400,
        status: 'error',
        message: 'User information not found',
      }
    }
    return {
      statusCode: 200,
      status:'success',
      message: 'Update user information successful',
    }

  }

  async updateIsActive(id : string) : Promise<any> { 
    const user = await this.findOneById(id)
    if (!user) {
      return {
        statusCode: 404,
        status: 'error',
        message: 'User not found',
      }
    }
    user.isActivate =!user.isActivate;
    user.updatedAt = new Date();
    await this.usersRepository.save(user);
    return {
      statusCode: 200,
      status:'success',
      message: 'Update user activation successful',
    }
  }

  async deleteSoft(id: string) {
    const user = await this.dataSource
    .getRepository(Users)
    .createQueryBuilder('users')
    .where('users.id = :id', {id})
    .andWhere('users.deletedAt IS NULL')
    .getOne();

    if (!user) {
      return {
        statusCode: 404,
        status: 'error',
        message: 'User not found',
      }
    }
    user.deletedAt = new Date();
    user.updatedAt = new Date();
    await this.usersRepository.save(user);
    return {
      statusCode: 200,
      status:'success',
      message: 'Delete user successful',
    }
  }

  async recover(id: string) {
    try {
      const user = await this.dataSource
    .getRepository(Users)
    .createQueryBuilder('users')
    .where('users.id = :id', {id})
    .andWhere('users.deletedAt IS NOT NULL')
    .getOne();
      if (!user) {
        return {
          statusCode: 404,
          status: 'error',
          message: 'User not found',
        }
      }
      user.deletedAt = null;
      user.updatedAt = new Date();
      await this.usersRepository.save(user);
      return {
        statusCode: 200,
        status:'success',
        message: 'Recover user successful',
      }
      
    } catch (error) {
      throw error;
    }
  }



  //  private parseDate(dateString: string): Date {
  //   const [day, month, year] = dateString.split('/' || '-' ).map(Number);
  //   return new Date(year, month - 1, day); // JavaScript Date object sử dụng tháng 0-11
  // }

}
