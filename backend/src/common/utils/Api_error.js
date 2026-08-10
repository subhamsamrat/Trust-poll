class Api_error extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }

    static badrequest(message = "Bad request") {
        return new Api_error(400, message);
    }

    static notFound(message = "Not found") {
        return new Api_error(404, message);
    }

    static conflict(message = "Conflict") {
        return new Api_error(409, message);
    }

    static internal(message = "Internal server error") {
        return new Api_error(500, message);
    }
    static unauthorized(message = "Unauthorized") {
        return new Api_error(401, message);
    }
}

export default Api_error;
