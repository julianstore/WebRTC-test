import { useEffect, useState, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MicOffTwoToneIcon from '@mui/icons-material/MicOffTwoTone';
import MicTwoToneIcon from '@mui/icons-material/MicTwoTone';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';

import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { _audioTrack, _rtcClient, setAudioTrack, setRTCClient } from '../../store/slices/trackSlice';

const DeviceList = styled(Select)({
  background: 'rgba(72, 255, 245, 0.05) !important',
  border: '1.5px solid #48FFF5',
  color: 'white !important',
  borderRadius: '42px !important'
});

const DeviceItem = styled(MenuItem)({
  background: 'rgb(0, 0, 0) !important',
  color: 'white !important'
});

const MicOnButton = styled(Avatar)({
  border: '1.5px solid #48FFF5',
  background: 'rgba(72, 255, 245, 0.05) !important',
  color: '#48FFF5',
  cursor: 'pointer'
});

const MicOffButton = styled(Avatar)({
  border: '1.5px solid #FF1F70',
  background: 'rgba(72, 255, 245, 0.05) !important',
  color: '#FF1F70',
  cursor: 'pointer'
});

const WeDreamVolumeDown = styled(VolumeDown)({
  fontSize: '20px !important',
  color: '#48FFF5'
});

const WeDreamVolumeUp = styled(VolumeUp)({
  fontSize: '22x !important',
  color: '#48FFF5'
});

const TrackSlider = styled(Slider)({
  '& .MuiSlider-thumb': {
    background: 'rgba(0,0,0,0) !important'
  },
  '& .MuiSlider-track': {
    background: '#48FFF5 !important'
  },
  '& .MuiSlider-rail': {
    background: '#464646 !important'
  },
  '& .MuiSlider-markLabel': {
    color: '#48FFF5 !important'
  }
});

const MicDescription = styled(Typography)({
  fontFamily: 'Poppins !important',
  fontWeight: '400 !important',
  fontSize: '10px !important',
  lineHeight: '10.4px !important',
  color: '#C8DCFF !important',
  marginTop: '20px !important',
});

const DeviceWrapper = styled(Grid)`
  padding-right: 30px;
  @media only screen and (max-width: 900px) {
    padding-right: 0px;
  }
`;

function DevicePanel() {
  const [deviceList, setDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [device, setDevice] = useState('');
  const [micOn, setMicOn] = useState(false);
  const [volume, setVolume] = useState<number>(100);

  const dispatch = useAppDispatch();
  const audioTrack = useAppSelector(_audioTrack);
  const rtcClient = useAppSelector(_rtcClient);

  const isConnected = useCallback(() => {
    return rtcClient?.connectionState === 'CONNECTED'
  }, [rtcClient?.connectionState]);

  const updateRTCClient = useCallback((_rtcClient: any) => {
    dispatch(setRTCClient(_rtcClient));
  }, [dispatch]);

  const handleVolumeChange = useCallback((event: Event, newValue: number | number[]) => {
    setVolume(newValue as number);
    if (isConnected() && micOn && device && audioTrack != null) {
      audioTrack.setVolume(newValue as number);
    }
  }, [micOn, audioTrack, isConnected, device]);

  useEffect(() => {
    AgoraRTC.getMicrophones()
      .then((devices) => {
        setDeviceList(devices);
        setDevice(devices[0].deviceId);
      })
      .catch((e) => {
        console.log('get devices error!', e);
        toast.error('Can not find out devices');
      });
  }, []);

  const handleMicOn = async () => {
    const configA = {
      microphoneId: device
    };

    if (isConnected()) {
      const tempTrack: any = await AgoraRTC.createMicrophoneAudioTrack(configA);
      dispatch(setAudioTrack(tempTrack));
      await rtcClient?.publish([tempTrack]).then(() => {
        setMicOn(true);
        updateRTCClient(rtcClient);
      });
    }
  };

  const handleMicOff = async () => {
    await rtcClient?.unpublish([audioTrack]).then(() => {
      setMicOn(false);
      updateRTCClient(rtcClient);
    });
  };

  const resetMic = async () => {
    await rtcClient?.unpublish([audioTrack]);
    updateRTCClient(rtcClient);
    handleMicOn();
  }

  const handleDeviceChange = (e: any) => {
    setDevice(e.target.value);
    if (micOn) {
      resetMic();
    }
  };

  return (
    <>
      <DeviceWrapper
        container
        direction="row"
        justifyContent="center"
        alignItems="stretch"
        spacing={1}
      >
        <Grid item xs={12}>
          <Typography
            color={'#C8DCFF'}
            style={{ fontSize: 32, fontWeight: 500, fontFamily: 'Poppins', lineHeight: '33.28px' }}
          >
            Input
          </Typography>
          <Typography 
            color={'#C8DCFF'}
            style={{ fontSize: 16, fontFamily: 'Poppins', lineHeight: '16.64px' }}
            >
            Select a system audio source to stream
          </Typography>
        </Grid>
        <Grid item xs={12} style={{ marginTop: '20px' }}>
          <FormControl fullWidth>
            <DeviceList
              value={device}
              onChange={handleDeviceChange}
              displayEmpty
              IconComponent={() => (
                <ExpandMoreIcon style={{ marginRight: 15, color: '#48FFF5' }} />
              )}
              //   MenuProps={{
              //     classes: {
              //       paper: {
              //         background: 'rgb(0, 0, 0) !important',
              //         color: 'white !important'
              //       }
              //     }
              //   }}
              fullWidth
              tabIndex={5}
            >
              {deviceList.map((item, index) => {
                return (
                  <DeviceItem
                    sx={{
                      '&:hover': {
                        background: '#333 !important'
                      },
                      '&:focus': {
                        background: '#333 !important'
                      }
                    }}
                    key={index} value={item.deviceId}>
                    {item.label}
                  </DeviceItem>
                );
              })}
            </DeviceList>
          </FormControl>
        </Grid>
        {isConnected() && !micOn && device && (
          <Grid
            item
            xs={12}
            container
            style={{ marginTop: 50 }}
            direction="column"
            alignItems={'center'}
          >
            <MicOffButton onClick={handleMicOn}>
              <MicOffTwoToneIcon
                style={{ border: '50% solid #FF1F70', color: '#FF1F70' }}
              />
            </MicOffButton>
            <MicDescription>
              Input source is muted. Click to broadcast.
            </MicDescription>
          </Grid>
        )}
        {isConnected() && micOn && device && (
          <Grid
            item
            xs={12}
            container
            style={{ marginTop: 50 }}
            direction="column"
            alignItems={'center'}
          >
            <MicOnButton onClick={handleMicOff}>
              <MicTwoToneIcon
                style={{ border: '50% solid #48FFF5', color: '#48FFF5' }}
              />
            </MicOnButton>
            <MicDescription>
              Input source is broacasting. Click to mute.
            </MicDescription>

            <Stack style={{ marginTop: '10px', width: '50%' }} spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
              <WeDreamVolumeDown />
              <TrackSlider aria-label="Volume" value={volume} onChange={handleVolumeChange} />
              <WeDreamVolumeUp />
            </Stack>
          </Grid>
        )}
      </DeviceWrapper>
    </>
  );
}

export default DevicePanel;
