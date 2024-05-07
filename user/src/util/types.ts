import { Request } from "express";
import { UserDocument } from "src/schemas/user.schema";

export interface AuthReq extends Request{
    user: UserDocument
}