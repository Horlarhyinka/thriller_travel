import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { BrokerService } from 'src/broker/broker.service';

@Module({
  providers: [MailService, BrokerService],
  controllers: [MailController]
})
export class MailModule {}
