import {config} from "dotenv"

config()

export const appConfig ={
    port: process.env.PORT || 3001
}

export const amqpConfig = {
    url: process.env.AMPQ_URL || "amqp://localhost"
}

export const mailConfig = {
    host: process.env.MAIL_HOST!,
    port: process.env.MAIL_PORT!,
    service: process.env.MAIL_SERVICE!,
    auth: {
        user: process.env.MAIL_USER!,
        pass: process.env.MAIL_PASS!,
    },
    address: process.env.MAIL_ADDRESS

}