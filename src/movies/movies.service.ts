import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie, MovieDocument } from './movies.schema';
import { RateMovieDto } from './dto/rate-movie.dto';
import { User, UserDocument } from 'src/users/users.schema';

@Injectable()
export class MoviesService {
  constructor(
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createMovieDto: CreateMovieDto): Promise<Movie> {
    const candidate = await this.movieModel.findOne({
      name: createMovieDto.name,
    });
    if (candidate)
      throw new HttpException(
        'Фильм с таким названием уже существует',
        HttpStatus.BAD_REQUEST,
      );
    const movie = new this.movieModel({ ...createMovieDto, _id: uuidv4() });
    return movie.save();
  }

  findAll(): Promise<Movie[]> {
    return this.movieModel.find().exec();
  }

  findOne(id: string): Promise<Movie> {
    return this.movieModel.findById(id);
  }

  update(id: string, updateMovieDto: UpdateMovieDto): Promise<Movie> {
    return this.movieModel.findByIdAndUpdate(id, updateMovieDto, { new: true });
  }

  remove(id: string): Promise<Movie> {
    return this.movieModel.findByIdAndRemove(id);
  }

  async rate(id: string, { userRating }: RateMovieDto): Promise<Movie> {
    const movie = await this.movieModel.findById(id);
    let rating: number;
    let rateCount: number;

    if (!movie.rating) {
      rating = userRating;
      rateCount = 1;
    } else {
      rating = +(
        (movie.rating * movie.rateCount + userRating) /
        (movie.rateCount + 1)
      ).toFixed(2);
      rateCount = movie.rateCount + 1;
    }

    return this.movieModel.findByIdAndUpdate(
      id,
      { rateCount, rating },
      { new: true },
    );
  }

  sort(type: string) {
    if (type === 'max') {
      return this.movieModel.find().sort({ rating: 1 });
    }
    return this.movieModel.find().sort({ rating: -1 });
  }

  //saving on a local computer

  upload(fileName: string, id: string) {
    return this.movieModel.findByIdAndUpdate(
      id,
      { img: process.env.SERVER_URL + '/' + fileName },
      { new: true },
    );
  }

  // saving to the mongo database

  // upload(file: Express.Multer.File, id: string) {
  //   const base64Image = Buffer.from(file.buffer).toString('base64');

  //   return this.movieModel.findByIdAndUpdate(
  //     id,
  //     { img: base64Image },
  //     { new: true },
  //   );
  // }
}
