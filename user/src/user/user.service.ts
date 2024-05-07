import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { Roles } from 'src/util/enums';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>
    ){}

    async create(obj: object, role: Roles = Roles.BASIC){
        try{
        return this.userModel.create({...obj, role})

        }catch(ex){
            throw ex
        }
        
    }

    async getByEmail(email: string){
        return this.userModel.findOne({email})
    }

    async getById(id: string){
        return this.userModel.findById(id)
    }
}
