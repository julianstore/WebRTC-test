import { useContext, useState } from 'react';
import { injectStyle } from 'react-toastify/dist/inject-style';
import { ToastContainer, toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { Grid, Typography, Button, TextField } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import AuthContext from '../contexts/AuthContext';
import * as api from '../store/api-client';
import { PageContainer } from './PageContainer';

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

const PanelWrapper = styled(Grid)`
  margin-top: 100px !important;
  margin-left: 200px !important;
  @media only screen and (max-width: 900px) {
    margin-top: 50px !important;
    margin-left: 0px !important;
    padding: 0 20px;
  }
`;

const SignIn = () => {
  const authContext = useContext(AuthContext);
  const history = useHistory();
  const [userLogin, setUserLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (userLogin: string, password: string) => {
    if (!userLogin || !password) {
      toast.warning("You are missing email ID or password");
    } else {
      setLoading(true);
      await api.signIn(userLogin, password).then((res) => {
        if (res.status === 200) {
          toast.success('Success!!!');
          localStorage.setItem('wedream-auth-token', res.data.token);
          authContext.signin(res.data, () => {
            history.push('/home');
          });
        } else {
          toast.warning(res.data.ERR_CODE);
        }
      });
      setLoading(false);
    }
  };
  return (
    <PageContainer>
      <PanelWrapper container item xs={12} md={4} lg={3}>
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
              },
              'input:autofill': {
                background: 'red !important'
              },
              'input:-webkit-autofill': {
                textFillColor: 'white',
                boxShadow: '0 0 0px 1000px #000 inset'
              },
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
                color: 'white',
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
              },
              'input:-webkit-autofill': {
                textFillColor: 'white',
                boxShadow: '0 0 0px 1000px #000 inset'
              },
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
                color: 'white',
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
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </PageContainer>
  );
};
export default SignIn;
