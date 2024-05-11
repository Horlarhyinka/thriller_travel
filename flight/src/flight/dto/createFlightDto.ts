import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNotEmpty } from "class-validator";


export class CreateFlightDto{
    @IsNotEmpty()
    @ApiProperty()
    name: string

    @ApiProperty()
    @IsNotEmpty()
    @IsDate()
    flightTime: Date

    @ApiProperty()
    @IsNotEmpty()
    capacity: number

    @ApiProperty()
    @IsNotEmpty()
    origin: string

    @ApiProperty()
    @IsNotEmpty()
    destination: string

}