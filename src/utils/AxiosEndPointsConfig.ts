import axios from 'axios';

const AxiosEndPointsConfig = axios.create({
  baseURL: process.env.APP_BASE_API || "https://qa.chanceaapp.com:3232"
});

export default AxiosEndPointsConfig;
