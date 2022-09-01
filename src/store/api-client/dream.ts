import axios from 'axios';
import axiosInstance from '.';

// For Authorized request
const getAxiosInstance = () => {
  const token = JSON.parse(localStorage.getItem('curWeDreamRTCAccount') || '""');

  return axios.create({
    baseURL: process.env.REACT_APP_WEDREAM_API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token?.authToken?.accessToken || '',
    },
    params: { user_id: token.authToken.userId || '' }
  });
};

export const getDreamUser = () => {
  return getAxiosInstance()
    .get('/dream/user')
    .then((res) => res)
    .catch((err) => {
      return err.response;
    });
};
