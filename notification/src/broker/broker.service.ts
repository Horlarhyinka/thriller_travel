import { Injectable } from '@nestjs/common';
import * as amqp from "amqplib"
import { amqpConfig } from 'src/config/config';
import { Channels } from '../utils/enums'

@Injectable()
export class BrokerService {

    private connection = amqp.connect(amqpConfig.url)

    private async getChannel(queue: string){
    const connection = await this.connection;
    const channel = await connection.createChannel()
    await channel.assertQueue(queue)
    .then(ch=>console.log(`channel ${ch.queue} asserted...`))
    .catch(err=>console.log(`${queue} queue error: ${err}`))
    return channel
    }

  async consume(queue: string, fn: Function){
    const channel = await this.getChannel(queue)
    channel.consume(queue, async(msg)=>{

        channel.ack(msg)
        if(msg.content){
        try{
        let cnt = JSON.parse(msg.content.toString())
        return await fn(cnt)
        }catch(err){
            console.log(`${queue} consumer error: ${err}`)
        }
        }
    })
  }

  async sendToQueue(queue: string, data: any){
    const channel = await this.getChannel(queue)
    await channel.assertQueue(queue, {durable: true})
    .then(ch=>{
      console.log(`queue ${ch.queue} asserted`)
    })
    .catch(err=>{
      console.log(`Queue error ${err}`)
      throw err
    })
    const content = JSON.stringify(data)
    const res = channel.sendToQueue(queue, Buffer.from(content))
    await channel.close()
    return res
  } 
  
}
