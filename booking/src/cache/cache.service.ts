import { Injectable } from '@nestjs/common';
import * as redis from "redis";

@Injectable()
export class CacheService {
    private client: redis.RedisClientType
    constructor(){
    this.client = redis.createClient()
        this.client.connect()
        .then(()=>{
            console.log("connected to redis client")
        })
        .catch((err)=>{ console.log("redis error: ", err)})
    }
    async get(key: string){
        const raw = await this.client.get(key)
        if(raw )return JSON.parse(raw)
        return null
    }

    async set(key: string, data: any, exp=60){
        if(!data)return
        const str = JSON.stringify(data)
        await this.client.setEx(key, exp*1000, str)
    }

    async getOrSet(key: string, fn: Function, exp=60){
        const exist = await this.client.get(key)
        if(exist)return JSON.parse(exist)
        const n = await fn()
        if(!n)return null
        const str = JSON.stringify(n)
        await this.client.setEx(key, exp*1000, str)
        return n
    }

    async delete(key: string){
        return this.client.del(key)
    }
}


