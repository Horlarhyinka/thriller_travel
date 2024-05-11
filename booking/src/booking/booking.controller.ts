import { Controller, Post, Get, Put, Delete, Body, Req, HttpException, HttpStatus, Param } from '@nestjs/common';
import { CreateBookingDto } from './dto/createBookingDto';
import { AuthReq } from 'src/util/types';
import mongoose from 'mongoose';
import { BookingService } from './booking.service';
import { ApiBasicAuth, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BrokerService } from 'src/broker/broker.service';
import { Channels } from 'src/util/enums';

@ApiTags("Booking")
@Controller('booking')
export class BookingController {

        constructor(
            private bookingService: BookingService,
            private brokerService: BrokerService
        ){}

    @ApiBearerAuth()
    @Post("/")
    async createBooking(@Body() createBookingDto: CreateBookingDto, @Req() req: AuthReq){
        if(!createBookingDto.flightId || !mongoose.Types.ObjectId.isValid(createBookingDto.flightId))return new HttpException("provide a valid flightId", HttpStatus.BAD_REQUEST)
        const data = await this.bookingService.create(req.user._id.toString(), createBookingDto.flightId)
    
        await this.brokerService.sendToQueue(Channels.CUSTOM_MAIL, {email: req.user.email, content: `Your reservation has been booked successfully.`})
        return data
    }   

    @ApiBearerAuth()
    @Get("/")
    async getBookings(@Req() req: AuthReq){
        const bookings = await this.bookingService.getUserBookings(req.user._id)
        return bookings
    }

    @ApiBearerAuth()
    @Get("/by-flight/:id")
    async getFlightBookings(@Param("id") flightId: string){
        if(!flightId || !mongoose.Types.ObjectId.isValid(flightId))return new HttpException("provide a valid flightId", HttpStatus.BAD_REQUEST)
        const bookings = await this.bookingService.getFlightBookings(flightId)
        return bookings
    }

    @ApiBearerAuth()
    @Get("/by-user/:id")
    async getByUserId(@Param("id") userId: string){
        if(!userId || !mongoose.Types.ObjectId.isValid(userId))return new HttpException("provide a valid userId", HttpStatus.BAD_REQUEST)
        const bookings = await this.bookingService.getUserBookings(userId)
        return bookings
    }

    @ApiBearerAuth()
    @Get("/:id")
    async getBooking(@Req() req: AuthReq, @Param("id") bookingId: string){
        if(!bookingId || !mongoose.Types.ObjectId.isValid(bookingId))return new HttpException("provide a valid bookingId", HttpStatus.BAD_REQUEST)
        const target = await this.bookingService.getBooking(bookingId)
        if(req.user._id.toString() !== target._id.toString() && !req.user.role?.includes("ADMIN"))return new HttpException("your are not authorized", HttpStatus.FORBIDDEN)
        return target
    }

    @ApiBearerAuth()
    @Delete("/:id")
    async deleteBooking(@Req() req: AuthReq, @Param("id") bookingId: string){
        if(!bookingId || !mongoose.Types.ObjectId.isValid(bookingId))return new HttpException("provide a valid bookingId", HttpStatus.BAD_REQUEST)
        const target = await this.bookingService.getBooking(bookingId)
        if(req.user._id.toString() !== target._id.toString() && !req.user.role?.includes("ADMIN"))return new HttpException("your are not authorized", HttpStatus.FORBIDDEN)
        return this.bookingService.deleteBooking(bookingId)
    }
}
