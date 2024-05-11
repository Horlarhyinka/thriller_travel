import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FlightModule } from './flight/flight.module';
import { MongooseModule } from '@nestjs/mongoose';
import { BrokerModule } from './broker/broker.module';
import { AdminOnly, IsAuthenticated, RestrictTo } from './middleware/auth.middleware';
import { FlightController } from './flight/flight.controller';
import { BrokerService } from './broker/broker.service';
import { dbConfig } from './config/config';
import { Roles } from './util/enums';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [FlightModule, MongooseModule.forRoot(dbConfig.uri), BrokerModule, CacheModule],
  controllers: [AppController],
  providers: [AppService, BrokerService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer){
    consumer.apply(IsAuthenticated)
      .forRoutes(FlightController);
      consumer.apply(RestrictTo([Roles.ADMIN, Roles.SUPERADMIN]))
      .exclude({path: "flight", method: RequestMethod.GET}, {path: "flight/:id", method: RequestMethod.GET})
      .forRoutes(FlightController)
  }
}
