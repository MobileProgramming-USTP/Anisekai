import axios from "axios";
import { env } from "../../../src/config/env";

const baseURL = env.backendApiUrl;

export const backendEnabled = Boolean(baseURL);

export const backendClient = backendEnabled
  ? axios.create({
      baseURL,
      timeout: 10000,
    })
  : null;

export const setBackendAuthToken = (token) => {
  if (!backendClient) {
    return;
  }

  if (token) {
    backendClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete backendClient.defaults.headers.common.Authorization;
  }
};

export default backendClient;
