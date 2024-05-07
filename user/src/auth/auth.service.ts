import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { LoginDto } from './dto/loginDto';
import { ForgetPasswordDto } from './dto/forgetPasswordDto';
import {randomBytes} from "crypto"
import { ResetPasswordDto } from './dto/resetPasswordDto';
import { BrokerService } from 'src/broker/broker.service';
import { Channels } from 'src/util/enums';
import * as jwt from "jsonwebtoken"
import { appConfig } from 'src/config/config';

@Injectable()
export class AuthService implements OnModuleInit{
    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>,
        private brokerService: BrokerService
    ){}

    async login(loginDto: LoginDto){
        const user = await this.userModel.findOne({email: loginDto.email})
        if(!user)throw new HttpException("user not found", HttpStatus.NOT_FOUND)
        const passwordCorrect = await user.comparePassword(loginDto.password)
        if(!passwordCorrect)throw new HttpException("incorrect password", HttpStatus.BAD_REQUEST)
        const token = await user.generateToken()
        return {user: {...user.toObject(), password: undefined}, token}
    }

    async forgetPassword(forgetPasswordDto: ForgetPasswordDto){
        const user = await this.userModel.findOne({email: forgetPasswordDto.email})
        if(!user)throw new HttpException("user not found", HttpStatus.NOT_FOUND)
        const token = randomBytes(24).toString("hex")
        const tokenExpireAt = Date.now() + 1000 * 60 * 60 * 2 //2hrs
        user.resetToken = token
        user.tokenExpireAt = tokenExpireAt
        return user.save()
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto){
        const user = await this.userModel.findOne({resetToken: resetPasswordDto.token})
        if(!user)throw new HttpException("user not found", HttpStatus.NOT_FOUND)
        if(user.tokenExpireAt <= Date.now())throw new HttpException("token expired", HttpStatus.BAD_REQUEST)
        user.password = resetPasswordDto.password
        user.tokenExpireAt = undefined
        user.resetToken = undefined
        return user.save()
    }


    async onModuleInit() {
        await this.brokerService.consume(Channels.AUTHORIZE, async (d) => {
            
            const token = d?.token;
            if (!token) return this.sendUnauthorised();
    
            try {
                const r = jwt.verify(token, appConfig.secret) as { id: string };
                const { id } = r;
                if (!id) return this.sendUnauthorised();
    
                const user = await this.userModel.findById(id);
                if (!user) return this.sendUnauthorised("user not found");
    
                return this.brokerService.sendToQueue(Channels.AUTHRES, {
                    authorized: true,
                    data: { user: { ...user.toObject(), password: undefined } },
                    message: "authorized"
                });
            } catch (err) {
                console.log({ err });
                return this.sendUnauthorised();
            }
        });
    }
    
    private sendUnauthorised(message: string = "unauthorized") {
        return this.brokerService.sendToQueue(Channels.AUTHRES, { authorized: false, data: null, message });
    }
    

}
