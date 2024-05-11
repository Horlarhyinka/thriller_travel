import { Injectable } from '@nestjs/common';
import { createTransport, Transport } from 'nodemailer';
import { mailConfig } from 'src/config/config';


@Injectable()
export class MailService {

    constructor(
    ){}
    

        private readonly transport = createTransport({
           url: `smtp://${mailConfig.auth.user}:${mailConfig.auth.pass}@${mailConfig.host}?service=${mailConfig.service}&port=${mailConfig.port}`})

           sendMail(receiver: string, content: string){
            return this.transport.sendMail({
                to: receiver,
                html: content,
                from: mailConfig.address
            })
           }
}
