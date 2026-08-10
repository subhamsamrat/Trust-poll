import BaseDto from "../../../common/dto/baseDto.js";
import {z} from "zod";


class create_poll_dto extends BaseDto{
    static schema=z.object({
    title:z.string().min(1).max(255),
    creatorId:z.string().min(1),
    isActive:z.boolean().default(true).optional(),
    responseMode:z.enum(['verified','anonymous']).default('verified').optional(),
    expiresAt:z.coerce.date(), 
    isPublished:z.boolean().default(false).optional(),

    questions:z.array(z.object({
        question:z.string().min(1).max(255),

        options:z.array(z.object({
            text:z.string().min(1).max(255)
        })).min(2,"At least two options are required").max(10,"At most ten options are allowed")

    })).min(1,"At least one question is required").max(10,"At most ten questions are allowed")
})
}
export default create_poll_dto;