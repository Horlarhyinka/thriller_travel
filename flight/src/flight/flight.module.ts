import { Module } from '@nestjs/common';
import { FlightController } from './flight.controller';
import { FlightService } from './flight.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Flight, FlightSchema } from 'src/schemas/flight.schema';
import { Validator } from 'src/util/validator';
import { BrokerService } from 'src/broker/broker.service';

@Module({
  controllers: [FlightController],
  providers: [FlightService, Validator, BrokerService],
  imports: [MongooseModule.forFeature([{name: Flight.name, schema: FlightSchema}])]
})
export class FlightModule {}
