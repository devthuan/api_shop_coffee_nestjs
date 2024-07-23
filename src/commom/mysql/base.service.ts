import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository,  } from '@nestjs/typeorm';
import { DataSource, DeepPartial, Repository } from 'typeorm';
import { UserHasRoles } from 'src/auth/entities/user_has_roles.entity';
import { Roles } from 'src/auth/entities/roles.entity';
import { EmailService } from 'src/email/email.service';
import { AuthService } from 'src/auth/auth.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { BaseEntity } from './base.entity';


@Injectable()
export class BaseService<T extends BaseEntity> {

  constructor(

    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,

    private readonly repository : Repository<T>,
    
  ){}


  async findAll(page: number, limit: number, sortBy: string, sortOrder: string) {
    
    const queryBuilder = this.repository.createQueryBuilder('users')

    const [result, total] = await queryBuilder
    .where('users.deletedAt IS NULL')
    .orderBy(`users.${sortBy}`, sortOrder as 'ASC' | 'DESC')
    .take(limit)
    .skip((page - 1) * limit)
    .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      statusCode: 200,
      status:'success',
      message: 'Get users successful',
      total: total,
      totalPages: totalPages,
      currentPage: page,
      data: result,
    }
  }

  async findOne(id: string | any): Promise<T> {
    const entity = await this.repository.findOne({ where: { id, deletedAt: null}});
    if (!entity) {
      throw new Error('Entity not found');
    }
    return entity;
  }


  async deleteSoft(id: string | any) : Promise<any> {
    const entity = await this.repository.findOne({ where: { id } })
    if (!entity || entity.deletedAt) {
      return {
        statusCode: 404,
        status: 'error',
        message: 'Entity not found or already deleted',
      }
    }
    entity.deletedAt = new Date();
    await this.repository.save(entity);
    return {
      statusCode: 200,
      status:'success',
      message: 'Delete entity successful',
    }
  }

  async recover(id: string | any)  {
    try {
      const user = await this.repository.findOne({where: {id}})
      if (!user) {
        return {
          statusCode: 404,
          status: 'error',
          message: 'User not found',
        }
      }
      user.deletedAt = null;
      await this.repository.save(user);
      return {
        statusCode: 200,
        status:'success',
        message: 'Recover user successful',
      }
      
    } catch (error) {
      throw error;
    }
  }


}
