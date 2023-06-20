import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UsePipes,
  ValidationPipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Public } from 'src/decorators/publicRoutes-decorator';
import { ValidationPipe as myValidationPipe } from 'src/pipes/validation.pipe';
import { RateMovieDto } from './dto/rate-movie.dto';
import { diskStorage } from 'multer';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @UsePipes(myValidationPipe)
  @Post()
  create(@Body() createMovieDto: CreateMovieDto) {
    return this.moviesService.create(createMovieDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.moviesService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moviesService.findOne(id);
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @Put(':id')
  update(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto) {
    return this.moviesService.update(id, updateMovieDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moviesService.remove(id);
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('rate/:id')
  rate(@Param('id') id: string, @Body() rateMovieDto: RateMovieDto) {
    return this.moviesService.rate(id, rateMovieDto);
  }

  @Public()
  @Get('sort/:type')
  sort(@Param('type') type: string) {
    return this.moviesService.sort(type);
  }

  //saving on a local computer

  @Post('upload-file/:id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public',
        filename: (req, file, cb) => {
          return cb(null, file.originalname);
        },
      }),
    }),
  )
  uploadFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.moviesService.upload(file.originalname, id);
  }

  // saving to the mongo database

  // @Post('upload-file/:id')
  // @UseInterceptors(FileInterceptor('file'))
  // uploadFile(
  //   @Param('id') id: string,
  //   @UploadedFile() file: Express.Multer.File,
  // ) {
  //   return this.moviesService.upload(file, id);
  // }
}
