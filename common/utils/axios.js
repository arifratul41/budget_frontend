/**
 * @author Mojahedul Hoque Abul Hasanat
 * @since 24 October 2021
 */

import _axios from "axios";
import {
  throwApiError,
  throwNetworkError,
  throwServerError,
} from "../shared/errors";
import { getSession } from "next-auth/react";

export const MODULE = {
  WEB: process.env.NEXT_PUBLIC_NEXTAUTH_URL,
  REG: process.env.NEXT_PUBLIC_REG_URL,
  REG_BATCH: process.env.NEXT_PUBLIC_REG_BATCH_URL,
  CAS: process.env.NEXT_PUBLIC_CAS_URL,
  FFU: process.env.NEXT_PUBLIC_FFU_URL,
  CDR: process.env.NEXT_PUBLIC_CDR_URL,
  PMC: process.env.NEXT_PUBLIC_PMC_URL,
  EAP: process.env.NEXT_PUBLIC_EAP_URL,
  OAP: process.env.NEXT_PUBLIC_OAP_URL,
  SPP: process.env.NEXT_PUBLIC_SPP_URL,
  FTO: process.env.NEXT_PUBLIC_FTO_URL,
  MST: process.env.NEXT_PUBLIC_MST_URL,
  MOCK: process.env.NEXT_PUBLIC_API_MOCK_URL,
  FFU_BATCH: process.env.NEXT_PUBLIC_FFU_BATCH_URL,
  CDR_BATCH: process.env.NEXT_PUBLIC_CDR_BATCH_URL,
  FILE_SERVER_UPLOAD: `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/uploadFile`,
  FILE_SERVER_DOWNLOAD: `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/download?file=`,
  FRONTEND_REG: process.env.NEXT_PUBLIC_REG_URL_FRONTEND,
  FRONTEND_FFU: process.env.NEXT_PUBLIC_FFU_URL_FRONTEND,
  FRONTEND_CAS: process.env.NEXT_PUBLIC_CAS_URL_FRONTEND,
  FRONTEND_CDR: process.env.NEXT_PUBLIC_CDR_URL_FRONTEND,
  FRONTEND_PMC: process.env.NEXT_PUBLIC_PMC_URL_FRONTEND,
  FRONTEND_EAP: process.env.NEXT_PUBLIC_EAP_URL_FRONTEND,
  FRONTEND_OAP: process.env.NEXT_PUBLIC_OAP_URL_FRONTEND,
  FRONTEND_SPP: process.env.NEXT_PUBLIC_SPP_URL_FRONTEND,
  FRONTEND_MST: process.env.NEXT_PUBLIC_MST_URL_FRONTEND,
  FRONTEND_FTO: process.env.NEXT_PUBLIC_FTO_URL_FRONTEND,
};

const axios = _axios.create({
  timeout: Number(process.env.NEXT_PUBLIC_API_DEFAULT_TIMEOUT),
});

axios.interceptors.request.use(
  (config) => {
    console.debug(`API call: ${config.url}`);
    return config;
  },
  (error) => {
    console.error("Error in API call", error);
    return Promise.reject(error);
  },
);

export default axios;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  SERVER_ERROR: 500,
  NOT_ACCEPTABLE: 406,
  UNSUPPORTED_MEDIA_TYPE: 415,
  PRECONDITION_FAILED: 412,
  REQUEST_TIMEOUT: 408,
};

const REQUEST_STATUS = {
  GET: HTTP_STATUS.OK,
  PUT: HTTP_STATUS.OK,
  PATCH: HTTP_STATUS.OK,
  POST: HTTP_STATUS.CREATED,
  DELETE: HTTP_STATUS.NO_CONTENT,
};

const bearerToken = async ({ req }) => {
  const session = await getSession({ req });

  return session?.["accessToken"]
    ? {
        Authorization: `Bearer ${session["accessToken"]}`,
      }
    : {};
};
/**
 *
 * @param req
 * @param baseURL
 * @param url
 * @param params
 * @returns {Promise<{data: any, revision: string}|{error: {code: number, title: string, message: string}}>}
 */
export const getServerApi = async ({ req, baseURL, url, params = {} }) => {
  let res;

  try {
    res = await axios({
      method: "GET",
      baseURL,
      url,
      params,
      headers: { ...(await bearerToken({ req })) },
    });
  } catch (e) {
    let error = {
      title: e.type || "Network Error",
      code: e.code || e.response?.data?.status || e.response?.status || 0,
      message: e.response?.data?.message || e.toString(),
      api: `${baseURL}  ${e.request.path}`,
    };
    console.error(e);

    return { error };
  }

  if (res.status !== REQUEST_STATUS.GET) {
    let error = {
      title: "API Error",
      code: res.status,
      message: `Error in calling server API, HTTP status: ${res.statusText}`,
      api: `${baseURL}/${url}`,
    };
    return { error };
  }

  // NOTE: axios provides all header names in lower case
  return { data: res.data, revision: res.headers["etag"] };
};

/**
 *
 * @param req
 * @param baseURL
 * @param url
 * @param method
 * @param params
 * @param data
 * @param headers
 * @param isTimeoutExtended
 * @returns {Promise<{data: any, revision: string}|{error: ({code: number, title: string, message: string}|{code: *, title: (string), message: (string|string)})}|{error: {code: number, title: string, message: string}}>}
 */
export const requestApi = async ({
  req,
  baseURL,
  url,
  method = "GET",
  data = {},
  headers = {},
  params = {},
  isTimeoutExtended = false,
}) => {
  let res;
  try {
    const requestObj = {
      baseURL,
      method,
      url,
      data,
      params,
      headers: {
        ...headers,
        ...(await bearerToken({ req })),
      },
    };
    if (isTimeoutExtended) requestObj.timeout = 60 * 60 * 1000;
    res = await axios(requestObj);
  } catch (e) {
    console.log("Got Error in API call");
    console.dir(e);

    let error;
    if (e.response) {
      let { status } = e.response;
      error = {
        title:
          status >= HTTP_STATUS.BAD_REQUEST && status < HTTP_STATUS.SERVER_ERROR
            ? "API Error"
            : "Server Error",
        code: status,
        message:
          status === HTTP_STATUS.PRECONDITION_FAILED
            ? "Data was updated by another user"
            : e.response.data.message || e.toString(),
      };
    } else {
      error = {
        title: "Network Error",
        code: e.code || 0,
        message: e.toString(),
      };
    }

    return { error };
  }

  if (res.status !== REQUEST_STATUS[method]) {
    let error = {
      title: "API Error",
      code: res.data.status || 0,
      message:
        res.data.message ||
        `Error in calling server API, HTTP status: ${res.statusText}`,
    };

    return { error };
  }

  return { data: res.data, revision: res.headers["etag"] };
};

/**
 * Specifically made for use in Redux Toolkit payload creators.
 * @param req
 * @param baseURL
 * @param url
 * @param method
 * @param params
 * @param data
 * @param headers
 * @returns {Promise<{data: any, revision: string}>}
 */
export const callApi = async ({
  req,
  baseURL,
  url,
  method = "GET",
  data = {},
  headers = {},
  params = {},
}) => {
  let res;
  try {
    res = await axios({
      baseURL,
      method,
      url,
      params,
      data,
      headers: {
        ...headers,
        ...(await bearerToken({ req })),
      },
    });
  } catch (e) {
    console.log(`Got error in callApi to: ${url}, ${method}`);
    console.dir(e);

    if (e.response) {
      let { status } = e.response;
      let message = e.response.data.message || e.toString();

      if (
        status >= HTTP_STATUS.BAD_REQUEST &&
        status < HTTP_STATUS.SERVER_ERROR
      ) {
        if (status === HTTP_STATUS.PRECONDITION_FAILED) {
          message = "Data was updated by another user";
        }
        throwApiError(message, status);
      } else {
        throwServerError(message, status);
      }
    } else {
      throwNetworkError(e.toString());
    }
  }

  if (res.status !== REQUEST_STATUS[method.toUpperCase()]) {
    throwApiError(
      `Error in calling server API, HTTP status: ${res.statusText}`,
      res.status,
    );
  }

  return { data: res.data, revision: res.headers["etag"] };
};

export const parseCookie = (str) => {
  return str
    ?.split(";")
    .map((pair) => pair.split("="))
    .reduce((acc, pair) => {
      acc[decodeURIComponent(pair[0].trim())] = decodeURIComponent(
        pair[1]?.trim(),
      );
      return acc;
    }, {});
};

export const downloadRequest = ({
  baseURL,
  method,
  data,
  url,
  params,
  isTimeoutExtended = false,
}) =>
  requestApi({ baseURL, method, data, url, params, isTimeoutExtended }).then(
    ({ data, error }) => {
      if (error) return { error };
      const linkSource = `data:${data.type};base64,${data.source}`;
      const downloadLink = document.createElement("a");
      const fileName = data.name;
      downloadLink.href = linkSource;
      downloadLink.download = fileName;
      downloadLink.click();
    },
  );

export const urlToObject = async (url, fileName) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], fileName || "attachment", { type: blob.type });
};
