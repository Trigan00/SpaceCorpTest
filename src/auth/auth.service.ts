import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersService } from 'src/users/users.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private tokenService: TokenService,
  ) {}

  async login(userDto: LoginUserDto) {
    const user = await this.userService.getUserByEmail(userDto.email);
    if (!user)
      throw new HttpException(
        'Некорректный email или пароль',
        HttpStatus.BAD_REQUEST,
      );

    const passwordEquals = await bcrypt.compare(
      userDto.password,
      user.password,
    );

    if (!user || !passwordEquals) {
      throw new UnauthorizedException({
        message: 'Некорректный email или пароль',
      });
    }
    const tokens = this.tokenService.generateTokens({
      email: user.email,
      id: user._id,
    });
    await this.tokenService.saveToken(user._id, tokens.refreshToken);
    return {
      refreshToken: tokens.refreshToken,
      user: {
        email: user.email,
        id: user._id,
        token: tokens.accessToken,
      },
    };
  }

  async registration(userDto: RegisterUserDto) {
    const candidate = await this.userService.getUserByEmail(userDto.email);
    if (candidate)
      throw new HttpException(
        'Пользователь с таким email существует',
        HttpStatus.BAD_REQUEST,
      );
    const hashPassword = await bcrypt.hash(userDto.password, 12);

    const user = await this.userService.createUser({
      email: userDto.email,
      password: hashPassword,
    });

    const tokens = this.tokenService.generateTokens({
      email: user.email,
      id: user._id,
    });
    await this.tokenService.saveToken(user._id, tokens.refreshToken);

    return tokens;
  }

  async logout(refreshToken: string) {
    if (!refreshToken) return;
    const token = await this.tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    const userData = this.tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await this.tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.getUserByEmail(
      userData.email || userData.dataValues.email,
    );
    const tokens = this.tokenService.generateTokens({
      email: user.email,
      id: user._id,
    });

    await this.tokenService.saveToken(user._id, tokens.refreshToken);
    return {
      refreshToken: tokens.refreshToken,
      user: {
        email: user.email,
        id: user._id,
        token: tokens.accessToken,
      },
    };
  }
}
