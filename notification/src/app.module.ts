import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MailModule } from './mail/mail.module';
import { Channels, Clients } from './utils/enums';
import { amqpConfig } from './config/config';
import { BrokerService } from './broker/broker.service';

@Module({
  imports: [ClientsModule.register([{
    name: Clients.AUTH,
    transport: Transport.RMQ,
    options:{
      urls: [amqpConfig.url],
      queue: Channels.FORGET_PASSWORD,
      queueOptions: {
        durable: false,
      },
      noAck: true
    }
  },{
    name: Clients.AUTH,
    transport: Transport.RMQ,
    options:{
      urls: [amqpConfig.url],
      queue: Channels.RESET_PASSWORD,
      queueOptions: {
        durable: false,
      },
      noAck: true
    }
  },
]), MailModule],
  controllers: [AppController],
  providers: [AppService, BrokerService],
})
export class AppModule {}
