import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { GetUser, IUserRequest } from 'src/decorators/get-user.decorator';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) { }

    @Get('/info')
    async getProfile(@GetUser() user: IUserRequest) {
        return await this.userService.findUserById(user.uuid);
    }
}
