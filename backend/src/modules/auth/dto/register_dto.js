import Base_dto from "../../../common/dto/baseDto.js";
import { z } from "zod";

class register_dto extends Base_dto {
  static schema = z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters long")
      .max(20, "Name must be at most 20 characters long"),
    email: z.email("Please provide a valid email").toLowerCase(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .max(20, "Password must be at most 20 characters long"),
    role: z.enum(["user", "admin"]).default("user"),
  });
}

export default register_dto;
