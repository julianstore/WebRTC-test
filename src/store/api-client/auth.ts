import axiosInstance from '.';

export const signIn = (user_login: string, password: string) => {
  return axiosInstance
    .post('/account/login', {
      user_login: user_login,
      password: password
    })
    .then((res) => res)
    .catch((err) => {
      return err.response;
    });
};
