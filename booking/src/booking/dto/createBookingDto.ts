import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";


export class CreateBookingDto{
    @ApiProperty()
    @IsNotEmpty()
    flightId: string

}