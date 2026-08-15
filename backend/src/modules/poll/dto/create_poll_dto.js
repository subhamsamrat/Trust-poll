import BaseDto from "../../../common/dto/baseDto.js";
import {z} from "zod";


class create_poll_dto extends BaseDto{
   static schema = z
  .object({
    title: z.string().min(1).max(255),
    creatorId: z.string().min(1),
    isActive: z.boolean().default(true).optional(),
    responseMode: z.enum(["verified", "anonymous"]).default("verified").optional(),

    startsAt: z.coerce.date().optional(),
    expiresAt: z.coerce.date(),

    isPublished: z.boolean().default(false).optional(),

    questions: z.array(
      z.object({
        question: z.string().min(1).max(255),
        options: z.array(
          z.object({
            text: z.string().min(1).max(255),
          })
        )
        .min(2)
        .max(10),
      })
    )
    .min(1)
    .max(10),
  })
  .superRefine((data, ctx) => {
    const now = new Date();

    // startsAt cannot be in the past
    if (data.startsAt && data.startsAt < now) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startsAt"],
        message: "Start date cannot be in the past",
      });
    }

    // expiresAt cannot be in the past
    if (data.expiresAt < now) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expiresAt"],
        message: "Expiry date cannot be in the past",
      });
    }

    // expiresAt must be after startsAt
    if (data.startsAt && data.expiresAt <= data.startsAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expiresAt"],
        message: "Expiry date must be after the start date",
      });
    }
  });
}
export default create_poll_dto;