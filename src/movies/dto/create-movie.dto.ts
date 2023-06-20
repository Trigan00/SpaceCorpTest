import { IsNotEmpty } from 'class-validator';

export class CreateMovieDto {
  @IsNotEmpty({ message: 'не должно быть пустым' })
  readonly name: string;

  @IsNotEmpty({ message: 'не должно быть пустым' })
  readonly description: string;
}
