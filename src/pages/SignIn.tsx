import { Helmet } from 'react-helmet-async';
import {
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Button
} from '@mui/material';
import TextField from '@mui/material/TextField';
import { Box, styled } from '@mui/material';
import { useContext, useState } from 'react';
import AuthContext from '../contexts/AuthContext';
import * as api from '../store/api-client';
import { injectStyle } from 'react-toastify/dist/inject-style';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

if (typeof window !== 'undefined') {
  injectStyle();
}

const SignInWrapper = styled(Box)(
  ({ theme }) => `
          margin-top: ${theme.spacing(30)};
  `
);

const SignIn = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  console.log('signin');
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
    <>
      <Helmet>
        <title>Sign In</title>
      </Helmet>
      <SignInWrapper>
        <Container maxWidth="lg">
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={3}
          >
            <Grid item xs={6} alignItems="center" justifyItems={'center'}>
              <Card>
                <CardHeader title="Sign In" />
                <Divider />
                <CardContent>
                  <Grid item xs={8} style={{ margin: '10px auto' }}>
                    <TextField
                      id="standard-read-only-input"
                      label="User"
                      type="text"
                      value={userLogin}
                      variant="standard"
                      fullWidth
                      onChange={(e) => {
                        setUserLogin(e.target.value);
                      }}
                    />
                  </Grid>
                  <Grid item xs={8} style={{ margin: '10px auto' }}>
                    <TextField
                      id="standard-password-input"
                      label="Password"
                      type="password"
                      value={password}
                      variant="standard"
                      fullWidth
                      onChange={(e) => {
                        setPassword(e.target.value);
                      }}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    style={{ marginTop: '30px', textAlign: 'center' }}
                  >
                    <Button
                      sx={{ margin: 1 }}
                      variant="contained"
                      onClick={() => {
                        handleSignIn(userLogin, password);
                      }}
                    >
                      Sign In
                    </Button>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </SignInWrapper>
      <ToastContainer
        position="top-right"
        newestOnTop
        style={{ marginTop: 100, zIndex: '99999 !important' }}
      />
    </>
  );
};
export default SignIn;
