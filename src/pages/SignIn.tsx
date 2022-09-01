import { useContext, useState, useRef } from 'react';
import { injectStyle } from 'react-toastify/dist/inject-style';
import { ToastContainer, toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { Grid, Typography, Button, TextField } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';

import AuthContext from '../contexts/AuthContext';
import * as api from '../store/api-client';
import { PageContainer } from './PageContainer';

if (typeof window !== 'undefined') {
  injectStyle();
}

const useStyles = makeStyles({
  textField: {
      "& > div::after": {
        borderBottom: '1.5px solid #48FFF5 !important'
      }
  }
});

const Input = styled(TextField)({
  fontFamily: 'Poppins !important',
  fontWeight: '400 !important',
  fontSize: '16px !important',
  lineHeight: '24px !important',
  borderBottom: '1.5px solid #6A6F79 !important',
  '&:focus': {
    borderBottom: '1.5px solid #48FFF5 !important'
  }
});

const Description = styled(Typography)({
  color: '#C8DCFF !important',
  fontFamily: 'Poppins !important',
  fontWeight: '400 !important',
  fontSize: '16px !important',
  lineHeight: '16.64px !important',
});

const LoginBtn = styled(Button)({
  background: '#48FFF5 !important',
  boxShadow: '0px 0px 34px 2px rgba(72, 255, 245, 0.54) !important',
  borderRadius: '42px !important',
  color: 'black !important'
});

const LoginBtnCaption = styled(Typography)({
  fontFamily: 'Poppins !important',
  fontWeight: '700 !important',
  fontSize: '18px !important',
  lineHeight: '27px !important',
  letterSpacing: '-0.02em !important',
  padding: '5px !important',
});

const PanelWrapper = styled(Grid)`
  margin-top: 67px !important;
  padding-left: 14px;
  width: 300px !important;
  @media only screen and (max-width: 900px) {
    margin-top: 50px !important;
    padding: 0;
  }
  @media only screen and (max-width: 600px) {
    width: 100% !important;
  }
`;

const SignIn = () => {
  const authContext = useContext(AuthContext);
  const history = useHistory();
  const [userLogin, setUserLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const passwordInputRef = useRef(null);
  const classes = useStyles();

  const handleSignIn = async (userLogin: string, password: string) => {
    if (!userLogin || !password) {
      toast.warning("You are missing email ID or password");
    } else {
      setLoading(true);
      await api.signIn(userLogin, password).then((res) => {
        if (res.status === 200) {
          toast.success('Success!!!');
          localStorage.setItem('wedream-auth-token', res?.data?.authToken?.accessToken || '');
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
      <PanelWrapper container>
        <Grid item xs={12}>
          <Description>
            Sign in with your WeDream ID. If you don’t have one yet, sign up for
            one on the app first.
          </Description>
        </Grid>
        <Grid item xs={12} style={{ marginTop: '45px' }}>
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
                boxShadow: '0 0 0px 1000px #000 inset',
              },
            }}
            className={classes.textField}
            id="standard-read-only-input"
            label=""
            placeholder="E-mail"
            type="text"
            value={userLogin}
            variant="standard"
            onChange={(e) => {
              setUserLogin(e.target.value);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                (passwordInputRef.current as any).focus();
              }
            }}
            inputProps={{
              style: {
                color: 'white',
              }
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} style={{ marginTop: '30px' }}>
          <Input
            inputRef={passwordInputRef}
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
            className={classes.textField}
            label=""
            type="password"
            placeholder="Password"
            value={password}
            variant="standard"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSignIn(userLogin, password);
              }
            }}
            inputProps={{
              style: {
                color: 'white',
              }
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} style={{ marginTop: '60px', textAlign: 'center' }}>
          <LoginBtn
            variant="contained"
            onClick={() => {
              handleSignIn(userLogin, password);
            }}
            fullWidth
          >
            <LoginBtnCaption textTransform={'capitalize'}>Login</LoginBtnCaption>
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
