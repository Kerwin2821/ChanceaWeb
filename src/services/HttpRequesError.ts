import { GetHeader, ToastCall } from './../utils/Helpers';
import HttpService  from './HttpService';

const HttpError = async (TokenAuthApi:string, message:string) => {
  console.log(JSON.stringify(message),"el error");
    try {
        const host = process.env.APP_BASE_API;
        console.log(message)
        const header = await GetHeader(TokenAuthApi, 'application/json');
        const url2 = `/api/appchancea/messages/saveMessage/${message}`;
       const response = await HttpService('get', host, url2, {}, header);
       console.log(response)
    } catch (error) {
      /*   ToastCall('error', 'Tienes problemas de conexión', 'ES') */
    }
   
}


export default HttpError