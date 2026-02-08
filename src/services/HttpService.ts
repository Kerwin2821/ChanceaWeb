import Axios from 'axios';
import { AxiosError, AxiosResponse } from 'axios';
type Methods = 'get' | 'post' | 'put' | 'delete' | 'patch';

const CreateResponse = (
  method: Methods,
  host: string | undefined,
  url: string,
  req?: any,
  headers?: any,
  setLoader?: (e: boolean) => void
) => {
  const finalHost = host || process.env.APP_BASE_API || "https://qa.chanceaapp.com:3232"
  console.log(`${finalHost}${url}`)
  return new Promise<any>((resolve, reject) => {
    if (setLoader) {
      setLoader(true);
    }


    let response;
    if (method === 'get') {
      response = Axios[method](`${finalHost}${url}`, { headers });
    } else {
      response = Axios[method](`${finalHost}${url}`, req, { headers });
    }

    response
      .then((res: AxiosResponse) => {
        resolve(res.data);
      })
      .catch((err: AxiosError) => {
        reject(err);
      })
      .finally(() => {
        if (setLoader) {
          setLoader(false);
        }
      });
  });
};

export default CreateResponse;
