import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ApiKeyStrategy } from './strategy/apikey.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { privateKey, publicKey } from 'src/utils/keys';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [UserModule, PassportModule, JwtModule.register({
    privateKey: privateKey,
    publicKey: publicKey,
    signOptions: {
      expiresIn: '1d',
      algorithm: 'RS256',
    }
  }),
  ],
  providers: [AuthService, ApiKeyStrategy, JwtStrategy],
  controllers: [AuthController],
  // exports: [AuthService]
})
export class AuthModule { }
