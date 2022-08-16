import { Grid, Typography, Button, TextField } from '@mui/material';
import { useContext, useState } from 'react';
import AuthContext from '../contexts/AuthContext';
import * as api from '../store/api-client';
import { injectStyle } from 'react-toastify/dist/inject-style';
import { ToastContainer, toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import { PageContainer } from './PageContainer';
import styled from 'styled-components';

if (typeof window !== 'undefined') {
  injectStyle();
}

const Input = styled(TextField)({
  borderBottom: '1.5px solid #6A6F79 !important',
  '&:focus': {
    borderBottom: '1.5px solid #48FFF5 !important'
  }
});

const Description = styled(Typography)({
  color: 'white !important',
  fontWeight: 400,
  fontSize: 16
});

const LoginBtn = styled(Button)({
  textTransform: 'none',
  background: '#48FFF5 !important',
  boxShadow: '0px 0px 34px 2px rgba(72, 255, 245, 0.54)',
  borderRadius: '42px !important',
  color: 'black !important'
});

const LoginBtnCaption = styled(Typography)({
  fontWeight: 700,
  fontSize: '18px'
});

const PanelWrapper = styled(Grid)({
  marginTop: '100px !important',
  marginLeft: '200px !important'
});

const SignIn = () => {
  const authContext = useContext(AuthContext);
  const navigate = useHistory();
  const [userLogin, setUserLogin] = useState('');
  const [password, setPassword] = useState('');
  const handleSignIn = async (userLogin: string, password: string) => {
    await api.signIn(userLogin, password).then((res) => {
      if (res.status === 200) {
        toast.success('Success!!!');
        localStorage.setItem('wedream-auth-token', res.data.token);
        authContext.signin(res.data, () => {
          navigate('/home');
        });
      } else {
        toast.warning(res.data.ERR_CODE);
      }
    });
  };
  return (
    <PageContainer>
      <PanelWrapper container spacing={2} item xs={3}>
        <Grid item xs={12}>
          <Description>
            Sign in with your WeDream ID. If you don’t have one yet, sign up for
            one on the app first.
          </Description>
        </Grid>
        <Grid item xs={12} style={{ margin: '10px auto' }}>
          <Input
            sx={{
              '& .MuiFormLabel-root': {
                color: '#6A6F79'
              },
              '& .MuiFormLabel-root.Mui-focused': {
                color: '#48FFF5'
              }
            }}
            id="standard-read-only-input"
            label="E-mail"
            type="text"
            value={userLogin}
            variant="standard"
            onChange={(e) => {
              setUserLogin(e.target.value);
            }}
            inputProps={{
              style: {
                color: 'white !important',
                background: 'black'
              }
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} style={{ margin: '10px auto' }}>
          <Input
            sx={{
              '& .MuiFormLabel-root': {
                color: '#6A6F79'
              },
              '& .MuiFormLabel-root.Mui-focused': {
                color: '#48FFF5'
              }
            }}
            label="Password"
            type="password"
            value={password}
            variant="standard"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            inputProps={{
              style: {
                color: 'white !important',
                background: 'black'
              }
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} style={{ marginTop: '30px', textAlign: 'center' }}>
          <LoginBtn
            variant="contained"
            onClick={() => {
              handleSignIn(userLogin, password);
            }}
            fullWidth
          >
            <LoginBtnCaption>Login</LoginBtnCaption>
          </LoginBtn>
        </Grid>
      </PanelWrapper>
      <ToastContainer
        position="top-right"
        newestOnTop
        style={{ marginTop: 100, zIndex: '99999 !important' }}
      />
    </PageContainer>
  );
};
export default SignIn;
