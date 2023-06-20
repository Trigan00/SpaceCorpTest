import { IsString, IsEmail, Length } from 'class-validator';

export class RegisterUserDto {
  @IsString({ message: 'Должно быть строкой' })
  @IsEmail({}, { message: 'Некорректный email' })
  readonly email: string;

  @Length(6, 30, { message: 'Не меньше 6 и не больше 30' })
  readonly password: string;
}
