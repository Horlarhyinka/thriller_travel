import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";


export default class CreateUserDto{
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty()
    email: string

    @IsNotEmpty()
    @ApiProperty()
    firstName: string

    @IsNotEmpty()
    @ApiProperty()
    lastName: string

    @IsNotEmpty()
    @ApiProperty()
    password: string
}