import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from 'src/dto/user.dto';
import { AuthGuard } from '@nestjs/passport';

class DebugJwtGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    // INFO contiene il motivo esatto del fallimento di Passport!
    if (info) {
      console.log("=== PASSPORT DEBUG LOG ===");
      console.log("Messaggio di errore:", info.message);
      console.log("Dettagli errore (info):", info);
      console.log("==========================");
    }
    
    if (err || !user) {
      throw err || new UnauthorizedException('Non autorizzato da Debug Guard');
    }
    return user;
  }
}

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
