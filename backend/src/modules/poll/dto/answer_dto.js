import BaseDto from "../../../common/dto/baseDto.js";
import { z } from "zod";
class answer_dto extends BaseDto {
  static schema = z.object({
    answers:z.array(
        z.object({questionId: z.string().min(1),optionId: z.string().min(1)})
    ).min(1, "At least one answer is required").max(10, "Maximum 10 answers allowed")
        })
  };
export default answer_dto;