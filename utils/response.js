const sendResponse = (res, statusCode, success, message, data = null) => {
  res.status(statusCode).json({
    success,
    message,
    data
  });
};

const sendError = (res, statusCode, message, error = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    error: error ? error.message : null
  });
};

module.exports = { sendResponse, sendError };