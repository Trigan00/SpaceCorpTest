import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/users.schema';

@Injectable()
export class TokenService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  generateTokens(payload: { email: string; id: string }) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: '1h',
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '30d',
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  validateAccessToken(token: string) {
    try {
      const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      return userData;
    } catch (e) {
      return null;
    }
  }

  validateRefreshToken(token: string): jwt.JwtPayload {
    try {
      const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      return userData as jwt.JwtPayload;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  async saveToken(userId: string, refreshToken: string) {
    const token = this.userModel.findByIdAndUpdate(
      userId,
      { refreshToken },
      {
        new: true,
      },
    );
    return token;
  }

  async removeToken(refreshToken: string) {
    const tokenData = this.userModel.updateOne(
      { refreshToken },
      { refreshToken: '' },
    );

    return tokenData;
  }

  async findToken(refreshToken: string) {
    const tokenData = this.userModel.findOne({ refreshToken });
    return tokenData;
  }
}
