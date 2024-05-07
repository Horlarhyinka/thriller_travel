import { Controller, Post, Body, Inject, HttpException, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import CreateUserDto from './dto/createUserDto';
import { UserService } from './user.service';
import CreateAdminDto from './dto/createAdminDto';
import { Roles } from 'src/util/enums';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsSuperAdmin } from 'src/middlewares/auth.middleware';
@ApiTags("User")
@Controller('user')
export class UserController {
    constructor(
        private userService: UserService
    ){}
    @Post("/")
    async createUser(
        @Body() createUserDto:CreateUserDto
    ){
        const existing = await this.userService.getByEmail(createUserDto.email)
        if(existing)return new HttpException("email is already registered", HttpStatus.BAD_REQUEST)
        const user = await this.userService.create({...createUserDto})
        const token = await user.generateToken()
        return {...user.toObject(), password: undefined, token}
    }

    @Post("/admin")
    @ApiBearerAuth()
    async createAdmin(
        @Body() createAdminDto: CreateAdminDto
    ){
        const existing = await this.userService.getByEmail(createAdminDto.email)
        if(existing)return new HttpException("email is already registered", HttpStatus.BAD_REQUEST);
        createAdminDto && (createAdminDto.role = createAdminDto.role?.toUpperCase());
        if(!Object.values(Roles).includes(createAdminDto.role as any) || !createAdminDto.role?.includes(Roles.ADMIN))return new HttpException("invalid role", HttpStatus.BAD_REQUEST)
        const user = await this.userService.create({...createAdminDto}, createAdminDto.role as any)
        const token = await user.generateToken()
        return {...user.toObject(), password: undefined, token}
    }
}
