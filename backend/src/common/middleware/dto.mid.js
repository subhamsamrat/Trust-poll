import Api_error from '../utils/Api_error.js';

const dto_middleware=(dtoClass)=>{
    return (req,res,next)=>{
             const {errors,value}=dtoClass.validate(req.body);

              if(errors){
                throw Api_error.badrequest(errors);
              }

              req.body=value;
              next();
    }
}

export default dto_middleware;