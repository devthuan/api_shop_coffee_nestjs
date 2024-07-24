import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { EmailDto } from './dto/email.dto';
import { VerifyOTPDto } from './dto/verifyOTP.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { LoginGoogle } from './auth.interface';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post('register')
  register(@Body() userDto: CreateUserDto) {
    return this.authService.register(userDto);
  }

  @Get('login')
  login(@Body() userDto: CreateUserDto) {
    return this.authService.login(userDto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  google(@Req() req: any) {
    console.log(req)
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req) {
    // redirect to home page
    let infoUser : LoginGoogle = req.user
    return this.authService.loginWithGoogle(infoUser)
   
  }
  
  @Post('change-password')
  changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(changePasswordDto.email, changePasswordDto.oldPassword, changePasswordDto.newPassword);
  }

  @Post('forgot-password')
  forgotPassword(@Body() email: EmailDto) {
    return this.authService.forgotPassword(email.email);
  }

  @Post('send-otp')
  sendOTP(@Body() email: EmailDto) {
    return this.authService.sendOTP(email.email);
  }

  @Post('verify-otp')
  verifyOTP(@Body() verifyOTPDto: VerifyOTPDto) {
    return this.authService.verifyOTP(verifyOTPDto.email, verifyOTPDto.otp);
  }

 
}
