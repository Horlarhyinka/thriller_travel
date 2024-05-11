import * as Joi from "joi"

export class Validator{
    validateCreateFlightPayload(obj: object){
        return Joi.object({
            name: Joi.string().required(),
            flightTime: Joi.date().required(),
            capacity: Joi.number().min(0).required(),
            origin: Joi.string().required(),
            destination: Joi.string().required()
        }).validate(obj)
    }

    validateUpdateFlightPayload(obj: object){
        return Joi.object({
            name: Joi.string(),
            flightTime: Joi.date(),
            capacity: Joi.number().min(0),
            origin: Joi.string(),
            destination: Joi.string(),
            arrivalTime: Joi.date(),
            status: Joi.string(),
        }).validate(obj)
    }
}