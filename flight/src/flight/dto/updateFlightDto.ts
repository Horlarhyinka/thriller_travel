import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateFlightDto } from "./createFlightDto";


export class UpdateFlightDto extends PartialType(CreateFlightDto){
    @ApiProperty()
    arrivalTime?: Date

    @ApiProperty()
    status: string
}