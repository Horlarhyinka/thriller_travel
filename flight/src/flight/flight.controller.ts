import { Body, Controller, HttpException, HttpStatus, Param, Post, Put, Get, Delete } from '@nestjs/common';
import { CreateFlightDto } from './dto/createFlightDto';
import { FlightService } from './flight.service';
import { Validator } from 'src/util/validator';
import { UpdateFlightDto } from './dto/updateFlightDto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FlightStatus } from 'src/util/enums';

@ApiTags("flight")
// @ApiBearerAuth()
@Controller('flight')
export class FlightController {
    constructor(
        private flightService: FlightService,
        private validator: Validator
    ){}

    @ApiBearerAuth()
    @Post()
    async createFlight(@Body() createFlightDto: CreateFlightDto){
        const validatorRes = this.validator.validateCreateFlightPayload(createFlightDto)
        if(validatorRes.error)return new HttpException(validatorRes.error.message, HttpStatus.BAD_REQUEST)
        if(new Date(createFlightDto.flightTime) <= new Date())return new HttpException("flight time is invalid", HttpStatus.BAD_REQUEST)
        const flight = await this.flightService.create(createFlightDto)
        return flight
    }

    @ApiBearerAuth()
    @Put("/:id")
    async updateFlight(
        @Param("id") id: string,
        @Body() updateFlightDto: UpdateFlightDto
    ){
        const validatorRes = this.validator.validateUpdateFlightPayload(updateFlightDto)
        if(validatorRes.error)return new HttpException(validatorRes.error.message, HttpStatus.BAD_REQUEST)
        const target = await this.flightService.getById(id)
    if(!target)return new HttpException("flight not found", HttpStatus.NOT_FOUND)
        if(new Date(updateFlightDto.flightTime) <= new Date())return new HttpException("flight time is invalid", HttpStatus.BAD_REQUEST)
        if(updateFlightDto.status){
            const status = updateFlightDto.status.toUpperCase()
            if(!Object.values(FlightStatus).includes(status as any)){
                const message = `invalid status "${updateFlightDto.status}" status can only be ${Object.values(FlightStatus).join(", ")}`
                return new HttpException(message, HttpStatus.BAD_REQUEST)
            }
            updateFlightDto.status = updateFlightDto.status.toUpperCase()
        }
        if(updateFlightDto.arrivalTime){
            if((updateFlightDto.flightTime && new Date(updateFlightDto.flightTime) || new Date(target.flightTime) >= new Date(updateFlightDto.arrivalTime)) >= new Date(updateFlightDto.arrivalTime))return new HttpException("flight time cannot be greater than arrival time", HttpStatus.BAD_REQUEST)
        }

        const flight = await this.flightService.updateFlight(id, updateFlightDto)
        return flight
    }

    @ApiBearerAuth()
    @Get()
    async getFlights(){
        const flights = await this.flightService.query({})
        return flights
    }

    @ApiBearerAuth()
    @Get("/:id")
    async getFlight(@Param('id') id: string){
        //get from cache if exists
        const flight = await this.flightService.getById(id)
        if(!flight)return new HttpException("flight not found", HttpStatus.NOT_FOUND)
        return flight
    }

    @ApiBearerAuth()
    @Delete("/:id")
    async deleteFlight(@Param('id') id: string){
        const flight = await this.flightService.getById(id)
        if(!flight)return new HttpException("flight not found", HttpStatus.NOT_FOUND)
        await this.flightService.deleteFlight(id)
        //delete from cache 
        return flight
    }

}
