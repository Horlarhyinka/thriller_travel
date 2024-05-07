import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose"
import mongoose, { HydratedDocument } from "mongoose"
import { Roles } from "src/util/enums"
import {sign} from "jsonwebtoken"
import {appConfig} from "../config/config"
import * as bcrypt from "bcrypt"

export type UserDocument = HydratedDocument<User>

@Schema({timestamps: true})
export class User{
    @Prop({type: String, required: true})
    email: string

    @Prop({type: String, required: true})
    password: string

    @Prop({type: String, required: true})
    firstName: string

    @Prop({type: String, required: true})
    lastName: string

    @Prop({type: String, enum: Object.values(Roles)})
    role: string

    @Prop()
    tel: string

    @Prop()
    avatar: string

    @Prop()
    resetToken: string

    @Prop()
    tokenExpireAt: number

    generateToken: ()=>Promise<string>

    comparePassword: (plain: string)=>Promise<string>
}

export const UserSchema = SchemaFactory.createForClass(User)

UserSchema.methods.generateToken = async function(){
    return sign({id: this._id, role: this.role}, appConfig.secret, {expiresIn: "2d"})
}

UserSchema.methods.comparePassword = async function(plain: string){
    return bcrypt.compare(plain, this.password)
}   

UserSchema.pre("save", async function(next){
    if(this.isNew || this.isModified("password")){
    this.password = await hashPassword(this.password)
    }
    next()
})

UserSchema.pre("findOneAndUpdate",async function(next){
    const updates = this.getUpdate()
    if(updates["password"]){
      this.setUpdate({...updates, password: await hashPassword(updates["password"])})
    }
    next()
  })

  async function hashPassword(plain: string){
    const salt = await bcrypt.genSalt()
    return bcrypt.hash(plain, salt)
  }


  export const UserModel = mongoose.model(User.name, UserSchema)
