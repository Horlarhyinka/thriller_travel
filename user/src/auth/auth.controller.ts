import { Body, Controller, HttpException, HttpStatus, OnModuleInit, Patch, Post, Put } from '@nestjs/common';
import { LoginDto } from './dto/loginDto';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { ForgetPasswordDto } from './dto/forgetPasswordDto';
import { ResetPasswordDto } from './dto/resetPasswordDto';
import { BrokerService } from 'src/broker/broker.service';
import { Channels } from 'src/util/enums';
import * as jwt from "jsonwebtoken"
import { appConfig } from 'src/config/config';
import { UserService } from 'src/user/user.service';

@ApiTags("Auth")
@Controller('auth')
export class AuthController{

    constructor(
        private authService: AuthService,
        private brokerService: BrokerService,
        private userService: UserService
    ){}

    @Post("login")
    async login(
        @Body() loginDto: LoginDto
    ){
        if(!loginDto.email)return new HttpException("email is required", HttpStatus.BAD_REQUEST)
        if(!loginDto.password)return new HttpException("password is required", HttpStatus.BAD_REQUEST)
        const data = await this.authService.login(loginDto)
        return data
    }

    @Put("forget-password")
    async forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto){
        if(!forgetPasswordDto.email)return new HttpException("email is required", HttpStatus.BAD_REQUEST)
        const user = await this.authService.forgetPassword(forgetPasswordDto)
        //send message to forget-password-notification queue
        this.brokerService.queueForgetPassword({email: user.email, data: {token: user.resetToken}})

        return {message: `password reset link sent to ${user.email}`}
    }

    @Patch("forget-password/:resetToken")
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto){
        if(!resetPasswordDto.token)return new HttpException("token is required", HttpStatus.BAD_REQUEST)
        if(!resetPasswordDto.password || !resetPasswordDto.confirmPassword)return new HttpException("password and confirmPassword is required", HttpStatus.BAD_REQUEST)
        if(resetPasswordDto.password !== resetPasswordDto.confirmPassword)return new HttpException("password and confirmPassword must be the same", HttpStatus.BAD_REQUEST)
        const user = await this.authService.resetPassword(resetPasswordDto)
        await this.brokerService.queueResetPassword(user.email)
        const token = await user.generateToken()
        return {user: {...user.toObject(), password: undefined}, token}
    }


}