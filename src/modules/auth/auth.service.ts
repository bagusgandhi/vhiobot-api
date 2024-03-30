import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Env } from 'src/config/env-loader';
import { SignInCustomerDto } from './dto/signin-customer.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { Role } from './enum/roles.enum';

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
                const newUser = await this.userService.createUserCustomer({ ...signInCustomerDto, role: Role.Customer})
                
                return {
                    access_token: this.jwtService.sign({uuid: newUser.uuid, role: newUser.role }),
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
}
