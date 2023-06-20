import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidationException } from '../exceptions/validation.exception';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    const obj = plainToClass(metadata.metatype, value);
    const errors = await validate(obj);

    const error = {
      message: 'Некорректные данные',
    };
    if (errors.length) {
      errors.forEach((err) => {
        error[err.property] = Object.values(err.constraints)[0];
      });
      throw new ValidationException(error);
    }
    return value;
  }
}
