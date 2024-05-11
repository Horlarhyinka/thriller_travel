import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { FlightStatus } from "src/util/enums";

export type FlightDocument = mongoose.HydratedDocument<Flight>

@Schema({timestamps: true})
export class Flight{
    @Prop({type: String, required: true})
    name: string

    @Prop({type: String, required: true})
    capacity: number

    @Prop({type: Number, default: 0})
    passengers: number

    @Prop({type: String, enum: Object.values(FlightStatus), default: FlightStatus.UPCOMING})
    status: string

    @Prop()
    arrivalTime: Date

    @Prop({type: Date, required: true})
    flightTime: Date

    @Prop({type: String, required: true})
    origin: string

    @Prop({type: String, required: true})
    destination: string
}

export const FlightSchema = SchemaFactory.createForClass(Flight)
