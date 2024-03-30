import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInCustomerDto } from './dto/signin-customer.dto';
import { ApiKeyGuard } from './guard/apikey.guard';
import { Public } from 'src/decorators/public.decorator';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) { }

    @UseGuards(ApiKeyGuard)
    @Public()
    @Post('/signin')
    async signIn(@Body() signInCustomerDto: SignInCustomerDto) {

        return this.authService.signInCustomer(signInCustomerDto);
    }


}
