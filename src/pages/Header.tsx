import { Typography, Grid, Box } from '@mui/material';
import { useHistory } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import { useContext } from 'react';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import AgoraRTC, { ClientConfig } from 'agora-rtc-sdk-ng';
import {
  setRTCClient,
  setAudioList,
  _mpTrack,
  _audioTrack,
  _rtcClient
} from '../store/slices/trackSlice';
import { useEffect } from 'react';
import styled from 'styled-components';

const LogoBox = styled(Box)({
  fontFamily: 'Poppins',
  fontWeight: 700,
  fontSize: 64,
  background: 'linear-gradient(296.93deg, #47FFF5 24%, #FF1F70 65.95%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
});

const LogoOutBox = styled(Box)({
  color: '#48FFF5 !important',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
});

const Title = styled(Typography)({
  color: '#C8DCFF',
  fontWeight: 500,
  fontSize: '36px !important',
  marginTop: '25px !important'
});

const CenteredGrid = styled(Grid)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
})

export const Header = () => {
  const authContext = useContext(AuthContext);
  const history = useHistory();

  const config: ClientConfig = {
    mode: 'rtc',
    codec: 'h264'
  };
  const dispatch = useAppDispatch();

  useEffect(() => {
    let useClient = AgoraRTC.createClient(config);
    if (useClient) dispatch(setRTCClient(useClient));
    // eslint-disable-next-line
  }, []);

  const mpTrack = useAppSelector(_mpTrack);
  const audioTrack = useAppSelector(_audioTrack);
  const rtcClient = useAppSelector(_rtcClient);

  const handleLogout = async () => {
    if (rtcClient.connectionState === 'CONNECTED') {
      await rtcClient.unpublish(mpTrack ? [mpTrack] : []).then(() => {
        mpTrack.stopProcessAudioBuffer();
      });

      await mpTrack?.stop();
      await mpTrack?.close();

      await rtcClient?.unpublish(audioTrack ? [audioTrack] : []);
      await audioTrack?.stop();
      await audioTrack?.close();

      await rtcClient?.leave();
    }

    dispatch(setAudioList([]));
    authContext.signout(() => {
      history.push('/');
    });
  };

  return (
    <Grid container style={{ marginTop: 30 }}>
      <CenteredGrid item xs={12} md={5} lg={4}>
        <LogoBox>WeDream</LogoBox>
      </CenteredGrid>
      <CenteredGrid item xs={12} md={7} lg={6}>
        <Box>
          <Title style={{ textAlign: 'center', fontFamily: 'Poppins'}}>Audio Streaming Portal</Title>
        </Box>
      </CenteredGrid>
      {authContext.isAuthenticated && (
        <CenteredGrid item xs={12} lg={2} style={{ justifyContent: 'flex-end', padding: '10px 30px' }}>
          <LogoOutBox onClick={handleLogout} tabIndex={0}>
            <PersonOutlineIcon fontSize="large" />
            <Typography style={{ color: 'white' }}>
              Sign Out
            </Typography>
          </LogoOutBox>
        </CenteredGrid>
      )}
    </Grid>
  );
};
