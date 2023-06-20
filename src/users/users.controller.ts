import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from 'src/decorators/publicRoutes-decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  create(@Body() userDto: CreateUserDto) {
    return this.usersService.createUser(userDto);
  }

  @Public()
  @Get()
  getAll() {
    return this.usersService.getAllUsers();
  }
}
