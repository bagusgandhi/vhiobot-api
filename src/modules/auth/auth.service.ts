import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Env } from 'src/config/env-loader';
import { SignInAdminDto } from './dto/signin-admin.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { Role } from './enum/roles.enum';
import { SignInCustomerDto } from './dto/signin-customer.dto copy';
import { JwtPayload } from './interface/jwt.interface';
import { SignUpAdminDto } from './dto/signup-admin.dto copy';

const { SECRET_API_KEY } = Env();

@Injectable()
export class AuthService {

    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
    ) { }

    validateApiKey(apiKey: string) {
        return apiKey === SECRET_API_KEY;
    }

    async signInCustomer(signInCustomerDto: SignInCustomerDto) {
        try {
            const user = await this.userService.findUserByEmail(signInCustomerDto.email);
            // const { uuid, role } = user;

            if (!user) {
                const newUser = await this.userService.createUserCustomer({ ...signInCustomerDto, role: Role.Customer })

                return {
                    access_token: this.jwtService.sign({ uuid: newUser.uuid, role: newUser.role }),
                    user: newUser
                }
            }

            return {
                access_token: this.jwtService.sign({ uuid: user.uuid, user: user.role }),
                user: user
            }

        } catch (error) {
            throw new HttpException(
                {
                    statusCode: error.status,
                    data: {
                        message: error.message || 'Something went wrong!',
                    },
                },
                error.status,
            );
        }
    }

    async validatePassword(password: string, hashed: string) {
        return await bcrypt.compare(password, hashed);
    }

    async signInAdmin(signInAdminDto: SignInAdminDto) {
        try {
            const user = await this.userService.findUserByEmail(signInAdminDto.email);
            const { uuid, role, password } = user;

            const matched = await this.validatePassword(signInAdminDto.password, password);
            if (matched) {

                const payload: JwtPayload = {
                    uuid: uuid,
                    role: role,
                };

                return {
                    access_token: this.jwtService.sign(payload),
                    user: user
                }

            } else {
                throw new HttpException(
                    'Email atau password tidak sesuai!',
                    HttpStatus.UNAUTHORIZED
                );
            }
        } catch (error) {
            console.log(error);
            throw new HttpException(
                {
                    statusCode: error.status || HttpStatus.UNPROCESSABLE_ENTITY,
                    data: {
                        message: error.message || 'Something went wrong!',
                    },
                },
                error.status || HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
    }

    async signUpAdmin(signUpAdminDto: SignUpAdminDto) {
        try {
          const user = await this.userService.findUserByEmail(signUpAdminDto.email);

          if (user) {
            throw new HttpException(
              {
                statusCode: new BadRequestException(),
                message: `email has taken`,
              },
              HttpStatus.BAD_REQUEST,
            );
          }
    
          const { uuid, role } = await this.userService.create({
            ...signUpAdminDto,
            role: Role.Administrator,
          });

          const payload: JwtPayload = {
            uuid: uuid,
            role: role,
          };
    
    
          return {
            access_token: this.jwtService.sign(payload),
            user: user
        }
        } catch (error) {
          throw new HttpException(
            {
              statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
              data: {
                message: error.message,
              },
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
      }
}
