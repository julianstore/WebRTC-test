import { useEffect, useState, useContext, useCallback } from 'react';
import styled from 'styled-components';
import { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { ToastContainer, toast } from 'react-toastify';
import { Grid } from '@mui/material';
import Button from '@mui/material/Button';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Refresh from '@mui/icons-material/Refresh';
import { makeStyles } from '@material-ui/core/styles';

import AuthContext from '../../contexts/AuthContext';
import DevicePanel from './DevicePanel';
import FilePanel from './FilePanel';
import { PageContainer } from '../PageContainer';
import * as api from '../../store/api-client';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  _mpTrack,
  _audioTrack,
  _rtcClient,
  setAudioList,
  setRTCClient
} from '../../store/slices/trackSlice';

const useStyles = makeStyles({
  disableGrid: {
    pointerEvents: 'none',
    opacity: '0.4'
  },
  enableGrid: {
    pointerEvents: 'auto',
    opacity: '1'
  }
});

const MyButton = styled(Button)`
  font-family: Poppins !important;
  font-weight: 500 !important;
  color: #C8DCFF !important;
  @media only screen and (max-width: 900px) {
    width: 100%;
  }
`;

function Home() {
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<IAgoraRTCRemoteUser[]>([]);

  const dispatch = useAppDispatch();
  const classes = useStyles();
  const appId = process.env.REACT_APP_WEDREAM_APP_ID || '';
  // const userId = authContext.account?.authToken.userId;
  const sessionId = Number(authContext.account?.authToken.sessionId) || 0;

  const rtcClient = useAppSelector(_rtcClient);
  const mpTrack = useAppSelector(_mpTrack);
  const audioTrack = useAppSelector(_audioTrack);

  useEffect(() => {
    rtcClient?.on('user-published', async (user: any, mediaType: any) => {
      //   await rtcClient?.subscribe(user, mediaType);
      //   if (mediaType === 'video') {
      //     setUsers((prevUsers) => {
      //       return [...prevUsers, user];
      //     });
      //   }
      //   if (mediaType === 'audio') {
      //     user.audioTrack?.play();
      //   }
    });

    rtcClient?.on('user-unpublished', (user: any, type: any) => {
      if (type === 'audio') {
        user.audioTrack?.stop();
      }
      if (type === 'video') {
        setUsers((prevUsers) => {
          return prevUsers.filter((User) => User.uid !== user.uid);
        });
      }
    });

    rtcClient?.on('user-left', (user: any) => {
      setUsers((prevUsers) => {
        return prevUsers.filter((User) => User.uid !== user.uid);
      });
    });

    // rtcClient?.on('connection-state-change', function (state: any) {
    //   if (state === 'DISCONNECTED') handleJoin();
    // });
  }, [users, rtcClient]);

  const isConnected = useCallback(() => {
    return rtcClient?.connectionState === 'CONNECTED'
  }, [rtcClient?.connectionState]);

  const isDisConnected = useCallback(() => {
    return rtcClient?.connectionState === 'DISCONNECTED'
  }, [rtcClient?.connectionState]);

  const updateRTCClient = useCallback((_rtcClient: any) => {
    dispatch(setRTCClient(_rtcClient));
  }, [dispatch]);

  const handleRefresh = useCallback(async (isInterval: boolean) => {
    if (isConnected()) {
      await audioTrack?.stop();
      await audioTrack?.close();
      await mpTrack?.stop();
      await mpTrack?.close();
      await rtcClient?.leave().then(() => {
        dispatch(setAudioList([]));
        updateRTCClient(rtcClient);
      });
    }
    try {
      if (isDisConnected()) {
        setLoading(true);
        // //TODO: remove after testing
        // await rtcClient?.join(
        //   appId,
        //   "D5",
        //   null,
        //   sessionId
        // );
        // updateRTCClient(rtcClient);
        // setLoading(false);
        await api.getDreamUser().then(async (res) => {
          if (res.status === 200) {
            const channel = res.data.dreamChannel;
            const dreamId = res.data.dreamId;
            await api.joinDreamGroup(dreamId).then(async (res) => {
              if (res.status === 200) {
                try {
                  await rtcClient?.join(
                    appId,
                    channel,
                    null,
                    sessionId
                  );
                  updateRTCClient(rtcClient);
                  setLoading(false);
                } catch (e) {
                  setLoading(false);
                  toast.error('Can not join, please check if you disconnected from WeDream App');
                  console.error(e);
                }
              } else {
                setLoading(false);
                toast.warning("We had an issue connecting to the dream for streaming. Please try again");
                if (isInterval) setTimeout(() => handleRefresh(isInterval), 15000);
              }
            });
          } else {
            setLoading(false);
            toast.warning("Please sign-in to the WeDream App and join the dream you wish to broadcast");
            if (isInterval) setTimeout(() => handleRefresh(isInterval), 15000);
          }
        });
      }
    } catch(ex) {
      setLoading(false);
      toast.warning("Please sign-in to the WeDream App and join the dream you wish to broadcast");
      if (isInterval) setTimeout(() => handleRefresh(isInterval), 15000);
    }
  }, [appId, audioTrack, dispatch, isConnected, isDisConnected, mpTrack, updateRTCClient, rtcClient, sessionId]);

  useEffect(() => {
    handleRefresh(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageContainer>
      <Grid container>
        <Grid item md={11} lg={9}>
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="stretch"
            style={{ marginTop: 30, marginBottom: 80 }}
            spacing={5}
          >
            <Grid item xs={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingTop: '0' }}>
              <MyButton
                  variant="contained"
                  onClick={() => handleRefresh(false)}
                  tabIndex={3}
                >
                  <Refresh/>
                  Refresh
                </MyButton>
            </Grid>
            <Grid item xs={12} md={6} lg={5} className={ isConnected() ? classes.enableGrid : classes.disableGrid }>
              <DevicePanel/>
            </Grid>
            <Grid item xs={12} md={6} lg={7} className={ isConnected() ? classes.enableGrid : classes.disableGrid }>
              <FilePanel/>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
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
}

export default Home;
