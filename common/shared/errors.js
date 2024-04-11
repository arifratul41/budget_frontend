export const throwNetworkError = (message) => {
  let error = new Error(message);
  error.name = "NetworkError";
  throw error;
};

export const throwApiError = (message, code) => {
  let error = new Error(message);
  error.code = code;
  error.name = "ApiError";
  throw error;
};

export const throwServerError = (message) => {
  let error = new Error(message);
  error.code = 500;
  error.name = "ServerError";
  throw error;
};
