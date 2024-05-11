import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BrokerModule } from './broker/broker.module';
import { BookingModule } from './booking/booking.module';
import { MongooseModule } from '@nestjs/mongoose';
import { dbConfig } from './config/config';
import { BookingController } from './booking/booking.controller';
import { IsAuthenticated } from './middleware/auth.middleware';
import { BrokerService } from './broker/broker.service';
import { CacheModule } from './cache/cache.module';
import { CacheService } from './cache/cache.service';

@Module({
  imports: [BrokerModule, BookingModule, MongooseModule.forRoot(dbConfig.uri), CacheModule],
  controllers: [AppController],
  providers: [AppService, BrokerService, CacheService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer){
    consumer.apply(IsAuthenticated)
    .forRoutes(BookingController)
  }
}

