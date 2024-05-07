import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";


export class ResetPasswordDto{
    @IsNotEmpty()
    @ApiProperty()
    token: string

    @IsNotEmpty()
    @ApiProperty()
    password: string

    @IsNotEmpty()
    @ApiProperty()
    confirmPassword: string
}