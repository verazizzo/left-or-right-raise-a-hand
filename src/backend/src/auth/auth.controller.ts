import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from 'src/dto/user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async registerUser(@Body() user: UserDto) {
        return await this.authService.registerUser(user);
    }

    @Post('login')
    async login(@Body() user: UserDto) {
        return await this.authService.login(user);
    }

    @Delete('remove')
    @UseGuards(AuthGuard('jwt'))
    async deleteuser(@Req() req: any) {
        return await this.authService.deleteUser(req.user.id);
    }
}
