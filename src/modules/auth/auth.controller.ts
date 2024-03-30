import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInAdminDto } from './dto/signin-admin.dto';
import { ApiKeyGuard } from './guard/apikey.guard';
import { Public } from 'src/decorators/public.decorator';
import { SignInCustomerDto } from './dto/signin-customer.dto copy';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from './enum/roles.enum';
import { SignUpAdminDto } from './dto/signup-admin.dto copy';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) { }

    @UseGuards(ApiKeyGuard)
    @Public()
    @Post('/signin')
    async signIn(@Body() signInCustomerDto: SignInCustomerDto) {
        return await this.authService.signInCustomer(signInCustomerDto);
    }

    @Post('/admin/signin')
    async adminSignIn(@Body() signInAdminDto: SignInAdminDto){
        return await this.authService.signInAdmin(signInAdminDto);
    }

    @Roles(Role.Administrator)
    @Post('/admin/create')
    async createAdmin(@Body() signUpAdminDto: SignUpAdminDto){
        return await this.authService.signUpAdmin(signUpAdminDto);
    }


}
