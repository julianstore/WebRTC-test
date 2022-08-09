import { Helmet } from 'react-helmet-async';
import { Container, Grid } from '@mui/material';
import Button from '@mui/material/Button';
import { TextField } from '@mui/material';
import { useRef, useEffect, useState, useContext } from 'react';
import AgoraRTC, { ClientConfig, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import AuthContext from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import CheckIcon from '@mui/icons-material/Check';
// import 'react-h5-audio-player/lib/styles.css';
import Slider from '@mui/material/Slider';

// import AudioPlayer from 'react-h5-audio-player';
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
  const [channel, setChannel] = useState(
    'e5617602-8eef-4896-afa3-3a6f888d64ea'
  );
  const [deviceList, setDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [deviceA, setDeviceA] = useState('');
  const [micAOn, setMicAOn] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [paused, setPaused] = useState(false);
  const [audioTrackA, setAudioTrackA] = useState<any>(null);
  const [mpTrack, setMPTrack] = useState<any>(null);
  const [audioList, setAudioList] = useState<File[]>([]);
  const [curAudio, setCurAudio] = useState<File>();
  const [users, setUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);

  console.log(users);
  useEffect(() => {
    AgoraRTC.getMicrophones()
      .then((devices) => {
        setDeviceList(devices);
      })
      .catch((e) => {
        console.log('get devices error!', e);
        alert('Can not find out devices');
      });

    if (useClient.connectionState === 'CONNECTED') setIsJoined(true);

    useClient.on('user-published', async (user: any, mediaType: any) => {
      await useClient.subscribe(user, mediaType);
      console.log('subscribe success');
      if (mediaType === 'video') {
        setUsers((prevUsers) => {
          return [...prevUsers, user];
        });
      }
      if (mediaType === 'audio') {
        user.audioTrack?.play();
      }
      console.log('user List:', users);
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
      console.log('user List:', users);
    });

    useClient.on('user-left', (user: any) => {
      console.log('leaving', user);
      setUsers((prevUsers) => {
        return prevUsers.filter((User) => User.uid !== user.uid);
      });
      console.log('user List:', users);
    });

    useClient.on('connection-state-change', () => {
      console.log('status changed!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    });
  }, [users]);

  const handleLeave = async () => {
    await audioTrackA?.stop();
    await audioTrackA?.close();
    await mpTrack?.stop();
    await mpTrack?.close();

    await useClient?.leave();

    setIsJoined(false);
    setMicAOn(false);
    setAudioList([]);
  };
  const handleJoin = async () => {
    await useClient.leave();
    const configA = {
      microphoneId: deviceA
    };

    let randID = Math.random().toString();
    try {
      await useClient.join(
        appId,
        channel,
        null,
        'boomboxU$3r-' + randID //authContext.account?.userId
      );
      const tempTrackA: any = await AgoraRTC.createMicrophoneAudioTrack(
        configA
      );
      setAudioTrackA(tempTrackA);
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

  const audioChange = async (newAudio: any) => {
    mpTrack?.stopProcessAudioBuffer();
    console.log('newAudio:', newAudio);
    var fileConfig = {
      // can also be a https link
      source: newAudio
    };
    const tempMPTrack = await AgoraRTC.createBufferSourceAudioTrack(fileConfig);
    setMPTrack(tempMPTrack);

    setCurAudio(newAudio);
  };

  const fileUpload = async (e: any) => {
    setAudioList((list) => [...list, e.target.files[0]]);
    audioChange(e.target.files[0]);
  };

  const handleNext = () => {
    if (curAudio)
      audioChange(
        audioList.indexOf(curAudio) + 1 < audioList.length
          ? audioList[audioList.indexOf(curAudio) + 1]
          : audioList[0]
      );
  };

  const handlePrev = () => {
    if (curAudio)
      audioChange(
        audioList.indexOf(curAudio) - 1 >= 0
          ? audioList[audioList.indexOf(curAudio) - 1]
          : audioList[audioList.length - 1]
      );
  };

  const handlePlay = async () => {
    console.log(useClient.connectionState);
    console.log('paused:', paused);
    if (useClient.connectionState === 'CONNECTED' && mpTrack != null) {
      if (paused) {
        mpTrack.resumeProcessAudioBuffer();
        setPaused(false);
      } else {
        await useClient.publish([mpTrack]).then((res) => {
          mpTrack.startProcessAudioBuffer();
          // mpTrack.play();
        });
      }
    }
  };

  const handlePause = async () => {
    console.log(useClient.connectionState);
    setPaused(true);
    setPlaying(false);
    mpTrack.pauseProcessAudioBuffer();
  };

  const handleStop = async () => {
    if (useClient.connectionState === 'CONNECTED') {
      await useClient.unpublish([mpTrack]).then(() => {
        mpTrack.stopProcessAudioBuffer();
        setPaused(true);
        setPlaying(false);
      });
    }
  };

  const handleLogout = async () => {
    authContext.signout(() => {
      navigate('/');
    });
  };

  const handleDeviceAChange = (e: any) => {
    setDeviceA(e.target.value);
  };

  //   function formatDuration(value: number) {
  //     const minute = Math.floor(value / 60);
  //     const secondLeft = value - minute * 60;
  //     return `${minute}:${secondLeft < 10 ? `0${secondLeft}` : secondLeft}`;
  //   }

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
          <Grid item xs={12} container>
            <Grid item xs={6} container>
              <Grid item xs={4}>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!isJoined}
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
              </Grid>
              <Grid item xs={8}>
                <List>
                  {audioList.map((item: any, index: any) => {
                    return (
                      <ListItem disablePadding key={index}>
                        <ListItemButton>
                          <ListItemText
                            primary={item.name}
                            onClick={async () => {
                              audioChange(item);
                            }}
                          />
                          {item === curAudio && (
                            <ListItemIcon>
                              <CheckIcon />
                            </ListItemIcon>
                          )}
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              {curAudio && audioList.length !== 0 && (
                <>
                  <Slider
                    size="small"
                    value={position}
                    aria-label="Small"
                    // valueLabelDisplay="auto"
                    step={1}
                    min={0}
                    max={mpTrack?.duration}
                    onChange={(_, value) => {
                      setPosition(value as number);
                      mpTrack?.seekAudioBuffer(value);
                    }}
                  />
                </>
              )}

              <Button
                variant="contained"
                style={{ marginLeft: 10 }}
                disabled={!isJoined || mpTrack === null || !paused || playing}
                onClick={handlePlay}
              >
                Play
              </Button>

              <Button
                variant="contained"
                style={{ marginLeft: 10 }}
                disabled={!isJoined || mpTrack === null || paused}
                onClick={handlePause}
              >
                Pause
              </Button>

              <Button
                variant="contained"
                color="info"
                style={{ marginLeft: 10 }}
                disabled={!isJoined || mpTrack === null || paused}
                onClick={handleStop}
              >
                Stop
              </Button>
              <Button
                variant="contained"
                color="info"
                style={{ marginLeft: 10 }}
                disabled={!(audioList.length > 1 && curAudio)}
                onClick={handleNext}
              >
                Next
              </Button>
              <Button
                variant="contained"
                color="info"
                style={{ marginLeft: 10 }}
                disabled={!(audioList.length > 1 && curAudio)}
                onClick={handlePrev}
              >
                Prev
              </Button>
            </Grid>
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
