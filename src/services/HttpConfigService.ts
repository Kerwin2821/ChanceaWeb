import { AxiosEndPointsConfig } from "../utils";
import { AxiosError, AxiosResponse } from "axios";

const CreateResponse = (
  method: "get" | "post",
  url: string,
  req: any,
  headers?: any,
  setLoader?: (e: boolean) => void
) => {
  return new Promise<any>((resolve, reject) => {
    if (setLoader) {
      setLoader(true);
    }
    let response;
    if (method === "get") {
      response = AxiosEndPointsConfig[method](url, { headers });
    } else {
      response = AxiosEndPointsConfig[method](url, req, {
        headers,
        timeout: 6000,
      });
    }
    response.then((res: AxiosResponse) => {
      setTimeout(() => {
        if (setLoader) {
          setLoader(false);
        }
        resolve(res.data);
      }, 100);
    });
    response.catch((err: AxiosError) => {
      setTimeout(() => {
        if (setLoader) {
          setLoader(false);
        }
        reject(err?.response?.data);
      }, 100);
    });
  });
};

export default CreateResponse;
