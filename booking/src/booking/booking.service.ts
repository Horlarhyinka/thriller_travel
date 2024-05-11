import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BrokerService } from 'src/broker/broker.service';
import { Booking } from 'src/schema/booking.schema';
import { Channels, FlightStatus } from 'src/util/enums';

@Injectable()
export class BookingService {
    constructor(
        @InjectModel(Booking.name)
        private bookingModel: Model<Booking>,
        private brokerService: BrokerService
    ){}

    async create(userId: string, flightId: string){

        await this.brokerService.sendToQueue(Channels.GETFLIGHT, {id: flightId})
        const res = new Promise(async(resolve, reject)=>{
            //check cache for flight
            //if not flight call flight microservice
        return this.brokerService.consume(Channels.GETFLIGHTRES, async function(d){
            const flight = d?.data?.flight
            if(!flight)return reject("flight not found")
            if(new Date(flight.flightTime) <= new Date())return reject("cannot book an ongoing or past flight")
            if(flight.status !== FlightStatus.UPCOMING)return reject(`cannot book ${flight.status} flight`)
            if(flight.passengers >= flight.capacity)return reject("this flight has reached its maximum capacity")
            return resolve(flight)
       })
        })
    const data = res
    .catch(err=>{
        return {err}
    })
    .then(async(flight: any)=>{
    if(flight.err)return {err: flight.err}
       const booking = await this.bookingModel.create({flight: flight._id?.toString(), userId, seatNumber: flight.passengers + 1})
       await this.brokerService.sendToQueue(Channels.NEWBOOKING, {id: flight._id.toString()})
       flight.passengers += 1

       return {data: {...booking.toObject(), flight}}
    })

    if((data as any).err)throw new HttpException((data as any).err, HttpStatus.BAD_REQUEST)
    return data
    }

    getUserBookings(userId: string){
        return this.bookingModel.find({userId})
    }

    getFlightBookings(flightId: string){
        return this.bookingModel.find({flight: flightId})
    }

    getBooking(bookingId: string){
        return this.bookingModel.findById(bookingId)
    }

    async deleteBooking(bookingId: string){
        const target = await this.bookingModel.findById(bookingId)
        if(!target)throw new HttpException("booking not found", HttpStatus.NOT_FOUND)
        return this.bookingModel.findByIdAndDelete(target._id.toString())
    }

}
