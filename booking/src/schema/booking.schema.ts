import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type BookingDoc = HydratedDocument<Booking>

@Schema({timestamps: true})
export class Booking{
    @Prop({type: mongoose.Schema.Types.ObjectId})
    flight: string

    @Prop()
    seatNumber: number

    @Prop({type: mongoose.Types.ObjectId})
    userId: string
}

export const BookingSchema = SchemaFactory.createForClass(Booking)