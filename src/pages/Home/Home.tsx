import { useEffect, useState, useContext } from 'react';
import styled from 'styled-components';
import { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { Container, Grid } from '@mui/material';
import Button from '@mui/material/Button';
import { TextField } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import { ToastContainer, toast } from 'react-toastify';

import AuthContext from '../../contexts/AuthContext';
import DevicePanel from './DevicePanel';
import FilePanel from './FilePanel';
import { PageContainer } from '../PageContainer';
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
  }
});

const MyTextField = styled(TextField)({
  background: 'rgba(72, 255, 245, 0.05) !important',
  border: '1.5px solid #48FFF5 !important',
  borderRadius: '10px !important',
});

const MyButton = styled(Button)`
  @media only screen and (max-width: 900px) {
    width: 50%;
  }
`;

function Home() {
  const authContext = useContext(AuthContext);
  const [appId, setAppID] = useState('56dd54658f404b64a9bcc23c132be423');
  const [channel, setChannel] = useState(
    'e5617602-8eef-4896-afa3-3a6f888d64ea'
  );
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
      setIsJoined(!isJoined);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      toast.error('Can not join, please check App ID and Channel Name');
      console.error(e);
    }
  };

  return (
    <PageContainer>
      <Container maxWidth="lg">
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          style={{ marginTop: 30, marginBottom: 80 }}
          spacing={5}
        >
          <Grid item xs={12} md={4} lg={3}>
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
          <Grid item xs={12} md={4} lg={3}>
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
          <Grid item xs={12} md={4} lg={6} style={{ display: 'flex', alignItems: 'center' }}>
            <MyButton
              variant="contained"
              onClick={handleJoin}
              disabled={isJoined}
              tabIndex={3}
            >
              Join
            </MyButton>
            <MyButton
              variant="contained"
              color="info"
              onClick={handleLeave}
              disabled={!isJoined}
              style={{ marginLeft: 10 }}
              tabIndex={7}
            >
              Leave
            </MyButton>
          </Grid>
          <Grid item xs={12} md={6} lg={5}>
            <DevicePanel useClient={useClient} isJoined={isJoined} />
          </Grid>
          <Grid item xs={12} md={6} lg={7}>
            <FilePanel useClient={useClient} isJoined={isJoined} />
          </Grid>
        </Grid>
      </Container>
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
