import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ClientsModule, MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { amqpConfig, dbConfig } from './config/config';
import { BrokerModule } from './broker/broker.module';
import { IsSuperAdmin } from './middlewares/auth.middleware';
import { User, UserSchema } from './schemas/user.schema';
import { UserService } from './user/user.service';

@Module({
  imports: [
    MongooseModule.forRoot(dbConfig.uri),
    MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
    UserModule,
    ClientsModule.register([
      {
      name: "queue_1",
      transport: Transport.RMQ,
      options:{
        urls: [amqpConfig.url],
        queue: "user",
        queueOptions: {
          durable: false
        }
      }
    },

  ]),
    AuthModule,
    BrokerModule,

  ],
  controllers: [AppController],
  providers: [AppService, UserService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer){
    consumer.apply(IsSuperAdmin)
      .forRoutes({path: "user/admin", method: RequestMethod.POST})
  }
}