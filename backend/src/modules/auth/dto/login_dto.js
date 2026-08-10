import Base_dto from '../../../common/dto/baseDto.js';
import { z } from 'zod';

class login_dto extends Base_dto{
    static schema=z.object({
        email: z.email().lowercase(),
        password: z.string().min(6,"password must have 6 character")
    })
}

export default login_dto;