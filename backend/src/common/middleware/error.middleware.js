const errorMiddleware = (err, req, res, next) => {
  console.log("ERROR MIDDLEWARE RUNNING", err);

  const statusCode =
    err.statusCode ||
    (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError" ? 401 : 500);

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

export default errorMiddleware;
