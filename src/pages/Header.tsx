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
  fontWeight: 700,
  fontSize: 64,
  display: 'flex',
  background: 'linear-gradient(296.93deg, #47FFF5 24%, #FF1F70 65.95%)',
  width: 400,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginLeft: 50
});

const LogoOutBox = styled(Box)({
  color: '#48FFF5 !important',
  float: 'right',
  marginTop: '-50px !important',
  cursor: 'pointer',
  display: 'flex',
  paddingRight: 50
});

const Title = styled(Typography)({
  color: '#C8DCFF',
  fontWeight: 500,
  fontSize: '36px !important',
  marginTop: '25px !important'
});

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
      await rtcClient.unpublish([mpTrack]).then(() => {
        mpTrack.stopProcessAudioBuffer();
      });

      await mpTrack?.stop();
      await mpTrack?.close();

      await rtcClient?.unpublish([audioTrack]);
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
    <>
      <Grid container item xs={6} style={{ display: 'flex' }}>
        <LogoBox>WeDream</LogoBox>
        <Box>
          <Title>Audio Streaming Portal</Title>
        </Box>
      </Grid>
      {authContext.isAuthenticated && (
        <Grid item xs={2}>
          <LogoOutBox onClick={handleLogout}>
            <PersonOutlineIcon fontSize="large" />
            <Typography style={{ marginTop: 5, color: 'white' }}>
              Sign Out
            </Typography>
          </LogoOutBox>
        </Grid>
      )}
    </>
  );
};
