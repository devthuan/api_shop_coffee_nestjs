import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("register")
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortBy') sortBy: string = "createdAt",
    @Query("sortOrder") sortOrder: "ASC" | "DESC" = "DESC"
  ) {
    limit =  limit > 100 ? 100 : limit;
    return this.usersService.findAll(page, limit, sortBy, sortOrder);
  }

  @Get('deleted')
  findAllDeleted(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Query("sortBy") sortBy: string = "createdAt",
    @Query("sortOrder") sortOrder: "ASC" | "DESC" = "DESC"
  ) {
    limit = limit > 100 ? 100 : limit;
    sortOrder.toUpperCase()
    return this.usersService.findAllDeleted(page, limit, sortBy, sortOrder);
  }

  
  @Get('search')
  searchByEmail(
    @Query("email") email: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Query("sortBy") sortBy: string = "createdAt",
    @Query("sortOrder") sortOrder: "ASC" | "DESC" = "DESC"
  ) {
    return this.usersService.searchByEmail(email, page, limit, sortBy, sortOrder);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }
  @Put('lock/:id')
  updateIsActive(@Param('id') id: string) {
    return this.usersService.updateIsActive(id);
  }

  @Delete(':id')
  deleteSoft(@Param('id') id: string) {
    return this.usersService.deleteSoft(id);
  }

  @Put('recover/:id')
  recover(@Param('id') id: string) {
    return this.usersService.recover(id);
  }

}
