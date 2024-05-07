import { Injectable } from '@nestjs/common';
import * as amqp from "amqplib"
import { amqpConfig } from 'src/config/config';
import { Channels } from 'src/util/enums';

@Injectable()
export class BrokerService {

  private connection = amqp.connect(amqpConfig.url)

  private async getChannel(queue: string){
    const connection = await this.connection
    const channel = await connection.createChannel()
    await channel.assertQueue(queue)
    .then(ch=>{
      console.log(`queue ${ch.queue} asserted`)
    })
    .catch(err=>{
      console.log(`Queue error: ${err}`)
      throw err
    })
    return channel
  }

  async sendToQueue(queue: string, data: any){
    const channel = await this.getChannel(queue)
    const content = JSON.stringify(data)
    const res = channel.sendToQueue(queue, Buffer.from(content))
    await channel.close()
    return res
  } 

  async consume(queue: string, fn: Function){
    const channel = await this.getChannel(queue)
    channel.consume(queue, async(msg)=>{
      channel.ack(msg)
      if(msg.content){
        try{
          return await fn(JSON.parse(msg.content.toString()))
        }catch(ex){
          console.log(`${queue} consumer error: ${ex}`)
        }
      }
    })
  }

  queueForgetPassword(data: {email: string, data: {token: string}}){
    return this.sendToQueue(Channels.FORGET_PASSWORD, data)
  }

  queueResetPassword(email: string){
    return this.sendToQueue(email, {})
  }
  
}
