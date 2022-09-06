import { Typography, Grid, Box } from '@mui/material';
import { useHistory } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import { useContext, useCallback } from 'react';
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
  letterSpacing: '-0.02em',
  lineHeight: '66.56px',
  background: 'linear-gradient(296.93deg, #47FFF5 24%, #FF1F70 65.95%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  height: '66px',
  width: '348px',
  marginRight: '10px'
});

const LogoOutBox = styled(Box)({
  color: '#48FFF5 !important',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
});

const Title = styled(Typography)({
  fontFamily: 'Poppins !important',
  fontWeight: '500 !important',
  fontSize: '36px !important',
  lineHeight: '37.44px !important',
  color: '#C8DCFF',
  height: '66px',
  display: 'table-cell',
  verticalAlign: 'bottom',
  textAlign: 'center',
});

const LogoGrid = styled(Grid)`
  display: flex;
  justifyContent: flex-start;
  alignItems: flex-end;
  @media only screen and (max-width: 900px) {
    display: block;
  }
`;

const SignOutGrid = styled(Grid)({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'flex-end',
  padding: '10px 30px',
})

export const Header = () => {
  const authContext = useContext(AuthContext);
  const history = useHistory();

  const config: ClientConfig = {
    mode: 'rtc',
    codec: 'h264'
  };
  const dispatch = useAppDispatch();
  const mpTrack = useAppSelector(_mpTrack);
  const audioTrack = useAppSelector(_audioTrack);
  const rtcClient = useAppSelector(_rtcClient);

  const isConnected = useCallback(() => {
    return rtcClient?.connectionState === 'CONNECTED'
  }, [rtcClient?.connectionState]);

  const handleLogout = async () => {
    if (isConnected()) {
      await rtcClient.unpublish(mpTrack ? [mpTrack] : []).then(() => {
        mpTrack?.stopProcessAudioBuffer();
        dispatch(setRTCClient(rtcClient));
      });

      await mpTrack?.stop();
      await mpTrack?.close();

      await rtcClient?.unpublish(audioTrack ? [audioTrack] : []);
      await audioTrack?.stop();
      await audioTrack?.close();

      await rtcClient?.leave();
    }

    dispatch(setAudioList([]));
    authContext.signOut(() => {
      history.push('/');
    });
  };

  useEffect(() => {
    let rtcClient = AgoraRTC.createClient(config);
    if (rtcClient) dispatch(setRTCClient(rtcClient));
    // eslint-disable-next-line
  }, []);

  return (
    <Grid container>
      <LogoGrid item xs={12} lg={10}>
        <LogoBox>WeDream</LogoBox>
        <Box>
          <Title>Audio Streaming Portal</Title>
        </Box>
      </LogoGrid>

      {/* <LogoGrid item xs={12} md={5} lg={4}>
        <LogoBox>WeDream</LogoBox>
      </LogoGrid>
      <LogoGrid item xs={12} md={7} lg={6}>
        <Box>
          <Title>Audio Streaming Portal</Title>
        </Box>
      </LogoGrid> */}
      {authContext.isAuthenticated && (
        <SignOutGrid item xs={12} lg={2}>
          <LogoOutBox 
            onClick={handleLogout}
            onKeyPress={(e) => {
              console.log('e.key = ', e.key)
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleLogout();
              }
            }}
            tabIndex={0}
            >
            <PersonOutlineIcon fontSize="large" />
            <Typography style={{ color: 'white' }}>
              Sign Out
            </Typography>
          </LogoOutBox>
        </SignOutGrid>
      )}
    </Grid>
  );
};
