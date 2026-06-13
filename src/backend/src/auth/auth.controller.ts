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

    @Delete('remove')
    @UseGuards(AuthGuard('jwt'))
    async deleteuser(@Req() req: any) {
        return await this.authService.deleteUser(req.user.id);
    }
}
