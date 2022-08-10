import axios from 'axios';
// import { ACCESS_TOKEN } from '../../util/constants';

// For network requests that don't need these header-params, just create another axios instance
console.log(process.env);
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_WEDREAM_API_URL,
  headers: {
    //Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json' //multipart/form-data; boundary=----WebKitFormBoundaryBGVvH3OfggAP4Tad
  }
});

// Intercept requests and append current AUTH token to header
axiosInstance.interceptors.request.use(function (config: any) {
  const token = localStorage.getItem('wedream-auth-token');
  config.headers.Authorization = token ? token : '';
  //   const token = `eyJhbGciOiJIUzI1NiIsImtpZCI6Indnb2cxIiwibW9kIjoiQVBQIiwidHlwIjoiSldUIn0.eyJleHAiOjE2NjE4ODAyMzIsImlhdCI6MTY1NDEwNDIzMiwiaXNzIjoid2VkcmVhbSIsIm5hbSI6IlRlc3QgQXBwIiwibmJmIjoxNjU0MTA0MjMyLCJzdWIiOiIyIn0.1u2mvebHaHfUsseMMTsaHg1shbWu6AfTDnbhm7_ivOo`;
  //   config.headers.Authorization = token;
  return config;
});

// Intercept all responses, for handling errors in one place
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    //TODO: pop an alert with server error
    console.error(
      `AXIOS ERROR: ${error} \n RESPONSE FROM SERVER: ${error.response?.data}`
    );
    return Promise.reject(error);
  }
);

export default axiosInstance;
export * from './auth';
