import { HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { DeleteUserDto } from './dto/delete-user.dto';
import { CreateUserCUstomerDto } from './dto/create-user-customer.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);
    constructor(
        private readonly userRepository: UserRepository
    ) { }

    async createUserCustomer(createUserCustomerDto: CreateUserCUstomerDto) {
        try {
            const { email, name, role } = createUserCustomerDto;
            const email_existed: User = await this.userRepository.findByEmail(email);

            if (email_existed) {
                throw new HttpException(
                    { message: `Email ${email} is already used. Please use another email address!` },
                    HttpStatus.BAD_REQUEST
                );
            }

            // this.logger.debug({email_existed})

            const newUser = new User();
            newUser.email = email;
            newUser.name = name;
            newUser.role = role;
            newUser.provider = "google";
            return this.userRepository.save(newUser);

        } catch (error) {
            // this.logger.error(error);
            throw new HttpException(
                error.message,
                error.status
            );
        }
    }

    async findAllUser(page: number, limit: number) {
        try {
            const users = await this.userRepository.queryPaginate(page, limit);
            return users;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(
                error.message,
                error.statusCode
            );
        }
    }

    async findUserById(uuid: string) {
        try {
            const user = await this.userRepository.findById(uuid);
            return user;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(
                error.message,
                error.statusCode
            );
        }
    }

    async findUserByEmail(email: string) {
        try {
            const user = await this.userRepository.findByEmail(email);
            return user;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(
                error.message,
                error.statusCode
            );
        }
    }

    async deleteUser(deleteUserDto: DeleteUserDto) {
        try {
            const { uuid } = deleteUserDto;
            await this.userRepository.softDelete(uuid);

            return { message: "Delete user success!" }
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(
                error.message,
                error.status
            );
        }
    }
}
