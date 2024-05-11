import { Controller, OnModuleInit } from '@nestjs/common';
import { Ctx, MessagePattern, RmqContext } from '@nestjs/microservices';
import { Channels, Templates } from 'src/utils/enums';
import { MailService } from './mail.service';
import { BrokerService } from 'src/broker/broker.service';
import { compileTemplate } from 'src/utils/factory';

@Controller()
export class MailController implements OnModuleInit{

    constructor(
        private mailService: MailService,
        private brokerService: BrokerService
    ){}

    @MessagePattern(Channels.FORGET_PASSWORD)
    async forgetPassword(
        @Ctx() context: RmqContext
    ){
        let msg = context.getMessage()
        console.log("received", {msg})
        if(typeof msg === "string"){
            msg = await JSON.parse(msg)
        }
        const {email, data} = msg
        if(!email || !msg)return

        //get template
        const content = ""
        return this.mailService.sendMail(email, content )
    }

    async onModuleInit() {
        this.brokerService.consume(Channels.FORGET_PASSWORD, async(d)=>{
            const {email, data} = d
            if(!email || !data)return
            const content = await compileTemplate(Templates.FORGET_PASSWORD, {...data, title: "forget password"})
            await this.mailService.sendMail(email, content)
        })

        this.brokerService.consume(Channels.RESET_PASSWORD, async(d)=>{
            const {email} = d
            if(!email)return
            const content = await compileTemplate(Templates.RESET_PASSWORD, {title: "password reset successful"})
            await this.mailService.sendMail(email, content)
        })

        this.brokerService.consume(Channels.CUSTOM_MAIL, async(d)=>{
            const {email, content}=d
            if(!email || !content)return
            await this.mailService.sendMail(email, `<p> ${content} </p>`)
        })
    }
}
