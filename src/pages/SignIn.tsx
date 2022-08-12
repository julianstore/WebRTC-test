import { Grid, Typography, Button, TextField } from '@mui/material';
import { useContext, useState } from 'react';
import AuthContext from '../contexts/AuthContext';
import * as api from '../store/api-client';
import { injectStyle } from 'react-toastify/dist/inject-style';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from './PageContainer';
import { createStyles, makeStyles } from '@mui/styles';

if (typeof window !== 'undefined') {
  injectStyle();
}

const useStyles = makeStyles(() =>
  createStyles({
    inputField: {
      borderBottom: '1.5px solid #6A6F79 !important',
      '&:focus': {
        borderBottom: '1.5px solid #48FFF5 !important'
      }
    },
    input: {
      color: 'white !important',
      background: 'black'
    },
    description: {
      color: 'white !important',
      fontWeight: 400,
      fontSize: 16
    },
    panelWrapper: {
      marginTop: '100px !important',
      marginLeft: '200px !important'
    },
    loginBtn: {
      textTransform: 'none',
      background: '#48FFF5 !important',
      boxShadow: '0px 0px 34px 2px rgba(72, 255, 245, 0.54)',
      borderRadius: '42px !important',
      color: 'black !important'
    },
    loginBtnCaption: {
      fontWeight: 700,
      fontSize: '18px'
    }
  })
);

const SignIn = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const classes = useStyles();
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
      <Grid container spacing={2} item xs={3} className={classes.panelWrapper}>
        <Grid item xs={12}>
          <Typography className={classes.description}>
            Sign in with your WeDream ID. If you don’t have one yet, sign up for
            one on the app first.
          </Typography>
        </Grid>
        <Grid item xs={12} style={{ margin: '10px auto' }}>
          <TextField
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
            className={classes.inputField}
            onChange={(e) => {
              setUserLogin(e.target.value);
            }}
            inputProps={{ className: classes.input }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} style={{ margin: '10px auto' }}>
          <TextField
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
            className={classes.inputField}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            inputProps={{ className: classes.input }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} style={{ marginTop: '30px', textAlign: 'center' }}>
          <Button
            variant="contained"
            onClick={() => {
              handleSignIn(userLogin, password);
            }}
            fullWidth
            className={classes.loginBtn}
          >
            <Typography className={classes.loginBtnCaption}>Login</Typography>
          </Button>
        </Grid>
      </Grid>
      <ToastContainer
        position="top-right"
        newestOnTop
        style={{ marginTop: 100, zIndex: '99999 !important' }}
      />
    </PageContainer>
  );
};
export default SignIn;
