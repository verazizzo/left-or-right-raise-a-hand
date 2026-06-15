import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
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

    @Put('modify')
    @UseGuards(AuthGuard('jwt'))
    async modifyUser(@Body('name') name: string, @Body('surname') surname: string, @Req() req: any) {
        return await this.authService.modifyUser(name, surname, req.user.id)
    }

    @Get('user')
    @UseGuards(AuthGuard('jwt'))
    async getProfile(@Req() req: any) {
        return await this.authService.getProfile(req.user.id);
    }

    @Post('forgot-password')
    async forgotPassword(@Body('email') email: string) {
        return await this.authService.sendPasswordResetEmail(email);
    }

    @Post('reset-password-otp')
    async resetPasswordWithOtp(@Body('email') email: string, @Body('otp') otp: string, @Body('new_password') new_password: string) {
        return await this.authService.resetPasswordWithOtp(email, otp, new_password);
    }

    @Put('change-password')
    @UseGuards(AuthGuard('jwt'))
    async changePassword(@Req() req: any, @Body('new_password') new_password: string) {
        return await this.authService.updatePassword(req.user.id, new_password);
    }

    @Delete('remove')
    @UseGuards(AuthGuard('jwt'))
    async deleteuser(@Req() req: any) {
        return await this.authService.deleteUser(req.user.id);
    }
}
