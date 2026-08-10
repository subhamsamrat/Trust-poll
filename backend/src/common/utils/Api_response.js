class Api_response{

    static ok(res,message,data=null){
        return res.status(200).json({
            success:true,
            message,
            data
        })
    }
    static created(res,message,data=null){
        return res.status(201).json({
            success:true,
            message,
            data
        })
    }
}

export default Api_response;