import { IsNumber, Max, Min } from 'class-validator';

export class RateMovieDto {
  @IsNumber()
  @Min(1)
  @Max(10)
  readonly userRating: number;
}
