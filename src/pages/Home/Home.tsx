import { Container, Grid } from '@mui/material';
import Button from '@mui/material/Button';
import { TextField } from '@mui/material';
import { useEffect, useState, useContext } from 'react';
import { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import AuthContext from '../../contexts/AuthContext';
import DevicePanel from './DevicePanel';
import FilePanel from './FilePanel';
import Divider from '@mui/material/Divider';
import { createStyles, makeStyles } from '@mui/styles';
import { PageContainer } from '../PageContainer';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  _mpTrack,
  _audioTrack,
  _rtcClient,
  setAudioList
} from '../../store/slices/trackSlice';

var intervalId: any = null;

const useStyles = makeStyles(() =>
  createStyles({
    appId: {
      background: 'rgba(72, 255, 245, 0.05)',
      border: '1.5px solid #48FFF5',
      borderRadius: '10px !important'
    },
    input: {
      color: 'white !important'
    }
  })
);

function Home() {
  const authContext = useContext(AuthContext);
  const [appId, setAppID] = useState('56dd54658f404b64a9bcc23c132be423');
  const [channel, setChannel] = useState(
    'e5617602-8eef-4896-afa3-3a6f888d64ea'
  );
  const [isJoined, setIsJoined] = useState(false);
  const [users, setUsers] = useState<IAgoraRTCRemoteUser[]>([]);

  const classes = useStyles();

  const dispatch = useAppDispatch();

  const useClient = useAppSelector(_rtcClient);
  const mpTrack = useAppSelector(_mpTrack);
  const audioTrack = useAppSelector(_audioTrack);

  console.log('users:', users);
  useEffect(() => {
    if (useClient?.connectionState === 'CONNECTED') setIsJoined(true);

    useClient?.on('user-published', async (user: any, mediaType: any) => {
      await useClient?.subscribe(user, mediaType);
      console.log('subscribe success');
      if (mediaType === 'video') {
        setUsers((prevUsers) => {
          return [...prevUsers, user];
        });
      }
      if (mediaType === 'audio') {
        user.audioTrack?.play();
      }
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
      console.log('user List:', users);
    });

    useClient?.on('user-left', (user: any) => {
      console.log('leaving', user);
      setUsers((prevUsers) => {
        return prevUsers.filter((User) => User.uid !== user.uid);
      });
      console.log('user List:', users);
    });

    useClient?.on('connection-state-change', function (state: any) {
      if (state === 'DISCONNECTED') handleJoin();
    });

    useClient?.on('');
  }, [users, useClient]);

  const handleLeave = async () => {
    await audioTrack?.stop();
    await audioTrack?.close();
    await mpTrack?.stop();
    await mpTrack?.close();

    await useClient?.leave().then(() => {
      dispatch(setAudioList([]));
      setIsJoined(false);
      clearInterval(intervalId);
    });
  };

  const handleJoin = async () => {
    await useClient?.leave();

    try {
      await useClient?.join(
        appId,
        channel,
        null,
        'boomboxU$3r-' + authContext.account?.authToken.userId
      );

      setIsJoined(!isJoined);
    } catch (e) {
      alert('Can not join, please check App ID and Channel Name');
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
          style={{ marginTop: 30 }}
          spacing={5}
        >
          <Grid item xs={3}>
            <TextField
              label="App ID"
              type="text"
              name="app_id"
              value={appId}
              variant="standard"
              InputProps={{ className: classes.input }}
              required
              fullWidth
              onChange={(e) => {
                setAppID(e.target.value);
              }}
              className={classes.appId}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="Channel"
              type="text"
              name="channel"
              value={channel}
              variant="standard"
              InputProps={{ className: classes.input }}
              required
              fullWidth
              onChange={(e) => {
                setChannel(e.target.value);
              }}
              className={classes.appId}
            />
          </Grid>
          <Grid item xs={6}>
            <Button
              variant="contained"
              onClick={handleJoin}
              disabled={isJoined}
            >
              Join
            </Button>
            <Button
              variant="contained"
              color="info"
              onClick={handleLeave}
              disabled={!isJoined}
              style={{ marginLeft: 10 }}
            >
              Leave
            </Button>
          </Grid>
          <Grid item xs={5}>
            <DevicePanel useClient={useClient} isJoined={isJoined} />
          </Grid>
          <Divider style={{ color: 'white' }}></Divider>
          <Grid item xs={7} container>
            <FilePanel useClient={useClient} isJoined={isJoined} />
          </Grid>
        </Grid>
      </Container>
    </PageContainer>
  );
}

export default Home;
