import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from 'src/schema/booking.schema';
import { BrokerService } from 'src/broker/broker.service';

@Module({
  providers: [BookingService, BrokerService],
  controllers: [BookingController],
  imports: [MongooseModule.forFeature([{name: Booking.name, schema: BookingSchema}])]
})
export class BookingModule {}
