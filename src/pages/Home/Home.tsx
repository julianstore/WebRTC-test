import { useEffect, useState, useContext } from 'react';
import styled from 'styled-components';
import { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { ToastContainer, toast } from 'react-toastify';
import { Grid } from '@mui/material';
import Button from '@mui/material/Button';
import { TextField } from '@mui/material';
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
  setAudioList
} from '../../store/slices/trackSlice';

var intervalId: any = null;

const useStyles = makeStyles({
  textField: {
      "& > div::after": {
        border: "0 !important"
      }
  },
  disableGrid: {
    pointerEvents: 'none',
    opacity: '0.4'
  },
  enableGrid: {
    pointerEvents: 'auto',
    opacity: '1'
  }
});

const MyTextField = styled(TextField)({
  background: 'rgba(72, 255, 245, 0.05) !important',
  border: '1.5px solid #48FFF5 !important',
  borderRadius: '10px !important',
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
  const [appId, setAppID] = useState(process.env.REACT_APP_WEDREAM_APP_ID || '');
  const [channel, setChannel] = useState('');
  const [loading, setLoading] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [users, setUsers] = useState<IAgoraRTCRemoteUser[]>([]);

  const dispatch = useAppDispatch();
  const classes = useStyles();

  const useClient = useAppSelector(_rtcClient);
  const mpTrack = useAppSelector(_mpTrack);
  const audioTrack = useAppSelector(_audioTrack);

  useEffect(() => {
    if (useClient?.connectionState === 'CONNECTED') setIsJoined(true);

    useClient?.on('user-published', async (user: any, mediaType: any) => {
      //   await useClient?.subscribe(user, mediaType);
      //   console.log('subscribe success');
      //   if (mediaType === 'video') {
      //     setUsers((prevUsers) => {
      //       return [...prevUsers, user];
      //     });
      //   }
      //   if (mediaType === 'audio') {
      //     user.audioTrack?.play();
      //   }
    });

    useClient?.on('user-unpublished', (user: any, type: any) => {
      console.log('unpublished', user, type);
      if (type === 'audio') {
        user.audioTrack?.stop();
      }
      if (type === 'video') {
        setUsers((prevUsers) => {
          return prevUsers.filter((User) => User.uid !== user.uid);
        });
      }
    });

    useClient?.on('user-left', (user: any) => {
      console.log('leaving', user);
      setUsers((prevUsers) => {
        return prevUsers.filter((User) => User.uid !== user.uid);
      });
    });

    // useClient?.on('connection-state-change', function (state: any) {
    //   if (state === 'DISCONNECTED') handleJoin();
    // });
  }, [users, useClient]);

  const handleLeave = async () => {
    setLoading(true);
    await audioTrack?.stop();
    await audioTrack?.close();
    await mpTrack?.stop();
    await mpTrack?.close();

    await useClient?.leave().then(() => {
      dispatch(setAudioList([]));
      setIsJoined(false);
      clearInterval(intervalId);
    });
    setLoading(false);
  };

  const handleJoin = async () => {
    setLoading(true);
    await useClient?.leave();

    try {
      await useClient?.join(
        appId,
        channel,
        null,
        'boomboxU$3r-' + authContext.account?.authToken.userId
      );
      setIsJoined(true);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      toast.error('Can not join, please check App ID and Channel Name');
      console.error(e);
    }
  };

  const handleRefresh = async (isInterval: boolean) => {
    setLoading(true);
    try {
      if (isJoined) {
        await audioTrack?.stop();
        await audioTrack?.close();
        await mpTrack?.stop();
        await mpTrack?.close();
        await useClient?.leave().then(() => {
          dispatch(setAudioList([]));
          setIsJoined(false);
          clearInterval(intervalId);
        });
      }
      await api.getDreamUser().then(async (res) => {
        if (res.status === 200) {
          console.log('response = ', res.data);
          const tempChannel = res.data.dreamChannel;
          setChannel(tempChannel);
          try {
            await useClient?.leave();
            await useClient?.join(
              appId,
              tempChannel,
              null,
              'boomboxU$3r-' + authContext.account?.authToken.userId
            );
            setIsJoined(true);
            setLoading(false);
          } catch (e) {
            setLoading(false);
            toast.error('Can not join, please check if you disconnected from WeDream App');
            console.error(e);
          }
        } else {
          setLoading(false);
          toast.warning("Please sign-in to the WeDream App and join the dream you wish to broadcast");
          if (isInterval) {
            setTimeout(() => { handleRefresh(isInterval) }, 15000);
          }
        }
      });
    } catch(ex) {
      setLoading(false);
      toast.warning("Please sign-in to the WeDream App and join the dream you wish to broadcast");
      if (isInterval) {
        setTimeout(() => { handleRefresh(isInterval) }, 15000);
      }
    }
  }

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
            <Grid item xs={12} md={4} lg={3} style={{ display: 'none' }}>
              <MyTextField
                className={classes.textField}
                label="App ID"
                type="text"
                name="app_id"
                value={appId}
                variant="standard"
                InputProps={{
                  style: {
                    color: 'white',
                    padding: '5px 8px',
                  }
                }}
                InputLabelProps={{
                  style: {
                    color: '#48FFF5',
                    padding: '5px 10px'
                  }
                }}
                required
                multiline
                fullWidth
                onChange={(e) => {
                  setAppID(e.target.value);
                }}
                tabIndex={1}
              />
            </Grid>
            <Grid item xs={12} md={4} lg={3} style={{ display: 'none' }}>
              <MyTextField
                className={classes.textField}
                label="Channel"
                type="text"
                name="channel"
                value={channel}
                variant="standard"
                InputProps={{
                  style: {
                    color: 'white',
                    padding: '5px 8px',
                  }
                }}
                InputLabelProps={{
                  style: {
                    color: '#48FFF5',
                    padding: '5px 10px'
                  }
                }}
                required
                multiline
                fullWidth
                onChange={(e) => {
                  setChannel(e.target.value);
                }}
                tabIndex={2}
              />
            </Grid>
            <Grid item xs={12} md={4} lg={6} style={{ display: 'none', alignItems: 'center' }}>
              <MyButton
                variant="contained"
                onClick={handleJoin}
                disabled={isJoined}
              >
                Join
              </MyButton>
              <MyButton
                variant="contained"
                color="info"
                onClick={handleLeave}
                disabled={!isJoined}
                style={{ marginLeft: 10 }}
              >
                Leave
              </MyButton>
            </Grid>
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
            <Grid item xs={12} md={6} lg={5} className={ isJoined ? classes.enableGrid : classes.disableGrid }>
              <DevicePanel useClient={useClient} isJoined={isJoined} />
            </Grid>
            <Grid item xs={12} md={6} lg={7} className={ isJoined ? classes.enableGrid : classes.disableGrid }>
              <FilePanel useClient={useClient} isJoined={isJoined} />
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
