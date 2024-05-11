import { Injectable, NestMiddleware, OnModuleInit } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { BrokerService } from "src/broker/broker.service";
import { Channels, Roles } from "src/util/enums";
import { AuthReq } from "src/util/types";

@Injectable()
export class IsAuthenticated implements NestMiddleware{
    constructor(
        private brokerService: BrokerService
    ){

    }
    async use(req: AuthReq, res: Response, next: (error?: Error | any) => void) {
        const tHeader = req.headers["authorization"]
        if(!tHeader)return res.status(401).json({message: "unauthenticated: provide a valid bearer token"})
        const [prefix, token] = tHeader.split(" ")
        if(prefix.toLowerCase() !== "bearer" || !token)return res.status(401).json({message: "unauthenticated: provide a valid bearer token"})

        
        //check cache for token value

        //if no value

        //call user auth service

        //save response to cache with short time

        const autRes = await new Promise(async(resolve, reject)=>{
            try{
                await this.brokerService.sendToQueue(Channels.AUTHORIZE, {token})
                await this.brokerService.consume(Channels.AUTHRES, (d: any)=>{
                resolve(d)
                }) 
            }catch(ex){
                reject(false)
            }  
    }) as any
        if(!autRes)return res.status(401).json({message: "authentication failed"})
        if(!autRes?.authorized)return res.status(401).json({message: "unauthenticated"})
        req.user = autRes.data.user
        next() 
    }
}

export function RestrictTo(roles: string[]){
    @Injectable()
    class Authorize implements NestMiddleware{
        use(req: AuthReq, res: any, next: (error?: Error | any) => void) {
            const role = req.user.role
            if(!roles?.includes(role))return res.status(401).json({message: "You are not authorized for this action"})
            return next()
        }
    }
    return Authorize
}

@Injectable()
export class AdminOnly implements NestMiddleware{
    use(req: any, res: any, next: (error?: Error | any) => void) {
        const role = req.user.role
            if(role !== Roles.ADMIN || role !== Roles.SUPERADMIN)return res.status(401).json({message: "You are not authorized for this action"})
            return next()
    }
}

