import { ApiProperty } from "@nestjs/swagger";
import CreateUserDto from "./createUserDto";
import { IsNotEmpty } from "class-validator";
import { Roles } from "src/util/enums";

export default class CreateAdminDto extends CreateUserDto{
    @ApiProperty()
    @IsNotEmpty()
    role: string
}