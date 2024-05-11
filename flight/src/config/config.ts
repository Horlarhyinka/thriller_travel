import * as dotenv from "dotenv"

dotenv.config()

export const appConfig = {
    port: process.env.PORT || 5000,
    host: process.env.HOST || "localhost",
    secret: process.env.APP_SECRET,
    mode: process.env.NODE_ENV
}

export const dbConfig = {
    uri: process.env.DB_URI
}

export const amqpConfig = {
    url: process.env.AMQP_URL || "amqp://localhost"
}

export const redisConfig = {
    url: ""
}