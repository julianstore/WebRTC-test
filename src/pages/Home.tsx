import { Helmet } from 'react-helmet-async';
import { Container, Grid } from '@mui/material';
import Button from '@mui/material/Button';
import { TextField } from '@mui/material';
import { useRef, useEffect, useState, useContext } from 'react';
import AgoraRTC, {
  ClientConfig,
  UID,
  IAgoraRTCRemoteUser
} from 'agora-rtc-sdk-ng';
import AuthContext from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

const config: ClientConfig = {
  mode: 'rtc',
  codec: 'h264'
};
let useClient = AgoraRTC.createClient(config);
function Home() {
  const fileInput = useRef<HTMLInputElement>(null);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const [appId, setAppID] = useState('56dd54658f404b64a9bcc23c132be423');
  const [channel, setChannel] = useState('djemo');
  const [deviceList, setDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [deviceA, setDeviceA] = useState('');
  const [deviceB, setDeviceB] = useState('');
  const [micAOn, setMicAOn] = useState(false);
  const [micBOn, setMicBOn] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [mpOn, setMpOn] = useState(false);
  const [audioTrackA, setAudioTrackA] = useState<any>();
  const [audioTrackB, setAudioTrackB] = useState<any>();
  const [mpTrack, setMPTrack] = useState<any>(null);

  const [users, setUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  console.log(users);
  useEffect(() => {
    AgoraRTC.getMicrophones()
      .then((devices) => {
        console.log('device Ids');
        console.log(devices);
        setDeviceList(devices);
      })
      .catch((e) => {
        console.log('get devices error!', e);
        alert('Can not find out devices');
      });

    console.log('init status', useClient.connectionState);

    useClient.on('user-published', async (user: any, mediaType: any) => {
      //   await useClient.subscribe(user, mediaType);
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

    useClient.on('user-unpublished', (user: any, type: any) => {
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

    useClient.on('user-left', (user: any) => {
      console.log('leaving', user);
      setUsers((prevUsers) => {
        return prevUsers.filter((User) => User.uid !== user.uid);
      });
    });

    useClient.on('connection-state-change', () => {
      console.log('status changed!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    });
  }, []);

  const handleLeave = async () => {
    await audioTrackA?.stop();
    await audioTrackA?.close();
    await audioTrackB?.stop();
    await audioTrackB?.close();
    await mpTrack?.stop();
    await mpTrack?.close();

    await useClient?.leave();

    setIsJoined(false);
    setMicAOn(false);
    setMicBOn(false);
  };
  const handleJoin = async () => {
    await useClient.leave();
    const configA = {
      microphoneId: deviceA
    };
    const configB = {
      microphoneId: deviceB
    };

    try {
      await useClient.join(
        appId,
        channel,
        null,
        'boomboxU$3r-' + authContext.account?.userId
      );
      const tempTrackA: any = await AgoraRTC.createMicrophoneAudioTrack(
        configA
      );
      setAudioTrackA(tempTrackA);
      const tempTrackB = await AgoraRTC.createMicrophoneAudioTrack(configB);
      setAudioTrackB(tempTrackB);
      setIsJoined(!isJoined);
    } catch (e) {
      alert('Can not join, please check App ID and Channel Name');
      console.error(e);
    }
  };

  const handleMicAOn = async () => {
    console.log('useClient.connectionState', useClient.connectionState);

    if (useClient.connectionState === 'CONNECTED') {
      await useClient.publish([audioTrackA]).then(() => {
        setMicAOn(!micAOn);
      });
    }
  };

  const handleMicAOff = async () => {
    await useClient.unpublish([audioTrackA]).then(() => {
      setMicAOn(!micAOn);
    });
  };

  const handleMicBOn = async () => {
    console.log('useClient.connectionState', useClient.connectionState);

    if (useClient.connectionState === 'CONNECTED') {
      await useClient.publish([audioTrackB]).then(() => {
        setMicBOn(!micBOn);
      });
    }
  };

  const handleMicBOff = async () => {
    await useClient.unpublish([audioTrackB]).then(() => {
      setMicBOn(!micBOn);
    });
  };

  const fileUpload = async (e: any) => {
    var fileConfig = {
      // can also be a https link
      source: e.target.files[0]
    };

    const tempMPTrack = await AgoraRTC.createBufferSourceAudioTrack(fileConfig);
    setMPTrack(tempMPTrack);
  };

  const handleMPOn = async () => {
    console.log('useClient.connectionState', useClient.connectionState);

    if (useClient.connectionState === 'CONNECTED') {
      await useClient.publish([mpTrack]).then(() => {
        mpTrack.startProcessAudioBuffer();
        // mpTrack.play();
        setMpOn(!mpOn);
      });
    }
  };

  const handleMPOff = async () => {
    await useClient.unpublish([mpTrack]).then(() => {
      setMpOn(!mpOn);
    });
  };

  const handleLogout = async () => {
    authContext.signout(() => {
      navigate('/');
    });
  };

  const handleDeviceAChange = (e: any) => {
    setDeviceA(e.target.value);
  };

  const handleDeviceBChange = (e: any) => {
    setDeviceB(e.target.value);
  };

  return (
    <>
      <Helmet>
        <title>Home - Applications</title>
      </Helmet>
      <Container maxWidth="lg">
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          style={{ marginTop: 100 }}
          spacing={1}
        >
          <Grid item xs={4}>
            <TextField
              label="App ID"
              type="text"
              name="app_id"
              value={appId}
              variant="standard"
              required
              fullWidth
              onChange={(e) => {
                setAppID(e.target.value);
              }}
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              label="Channel"
              type="text"
              name="channel"
              value={channel}
              variant="standard"
              required
              fullWidth
              onChange={(e) => {
                setChannel(e.target.value);
              }}
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
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">
                Microphone A
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={deviceA}
                label="Input Device"
                onChange={handleDeviceAChange}
              >
                {deviceList.map((item, index) => {
                  return (
                    <MenuItem key={index} value={item.deviceId}>
                      {item.label}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <Button
              variant="contained"
              disabled={!(deviceA !== '' && isJoined && !micAOn)}
              onClick={handleMicAOn}
            >
              On
            </Button>
            <Button
              variant="contained"
              color="info"
              style={{ marginLeft: 10 }}
              disabled={!micAOn}
              onClick={handleMicAOff}
            >
              Off
            </Button>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">
                Microphone B
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={deviceB}
                label="Input Device"
                onChange={handleDeviceBChange}
              >
                {deviceList.map((item, index) => {
                  return (
                    <MenuItem key={index} value={item.deviceId}>
                      {item.label}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <Button
              variant="contained"
              disabled={!(deviceB !== '' && isJoined && !micBOn)}
              onClick={handleMicBOn}
            >
              On
            </Button>
            <Button
              variant="contained"
              color="info"
              style={{ marginLeft: 10 }}
              disabled={!micBOn}
              onClick={handleMicBOff}
            >
              Off
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => fileInput?.current?.click()}
            >
              upload file
            </Button>
            <input
              ref={fileInput}
              type="file"
              style={{ display: 'none' }}
              onChange={fileUpload}
            />
            <Button
              variant="contained"
              style={{ marginLeft: 10 }}
              disabled={!(isJoined && mpTrack !== null && !mpOn)}
              onClick={handleMPOn}
            >
              MP3 On
            </Button>
            <Button
              variant="contained"
              color="info"
              style={{ marginLeft: 10 }}
              disabled={!mpOn}
              onClick={handleMPOff}
            >
              MP3 Off
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="warning" onClick={handleLogout}>
              Sign out
            </Button>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default Home;
