import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";
import * as jwt from "jsonwebtoken"
import { appConfig } from "src/config/config";
import { Roles } from "src/util/enums";
import { UserService } from "src/user/user.service";

@Injectable()
export class IsSuperAdmin implements NestMiddleware{
    constructor(
        private userService: UserService
    ){}
    async use(req: Request, res: Response, next: (error?: Error | any) => void) {
        const h = req.headers["authorization"]
        if(!h)return res.status(401).json({message: "unauthenticated: provide a bearer token"})
        const [prefix, token] = h.split(" ")
        if(!prefix || prefix.toLowerCase() !== "bearer" || !token)return res.status(401).json({message: "bearer token is required"})
        try {
            const {id} = await jwt.verify(token, appConfig.secret) as {id: string}
            const user = await this.userService.getById(id)
            if(!user)return res.status(401).json({message: "user not found"})
            if(user.role !== Roles.SUPERADMIN)return res.status(403).json({message: "your are not authorized for this action" })
            next()
        } catch (error) {
            return res.status(401).json({message: "unauthenticated"})
        }
    }
}

