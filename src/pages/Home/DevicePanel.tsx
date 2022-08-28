import { useEffect, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import styled from 'styled-components';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MicOffTwoToneIcon from '@mui/icons-material/MicOffTwoTone';
import MicTwoToneIcon from '@mui/icons-material/MicTwoTone';

import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { _audioTrack, setAudioTrack } from '../../store/slices/trackSlice';

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

const MicDescription = styled(Typography)({
  marginTop: '20px !important',
  color: '#C8DCFF',
  fontStyle: 'normal',
  fontWeight: 400,
  fontSize: 15
});

const DeviceWrapper = styled(Grid)`
  padding-right: 50px;
  border-right: 2px solid rgba(72, 255, 245, 0.25);
  @media only screen and (max-width: 900px) {
    border: 0px;
    padding-right: 0px;
  }
`;

function DevicePanel(props: any) {
  const { useClient, isJoined } = props;
  const [deviceList, setDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [device, setDevice] = useState('');
  const [micOn, setMicOn] = useState(false);

  const dispatch = useAppDispatch();
  const audioTrack = useAppSelector(_audioTrack);

  useEffect(() => {
    AgoraRTC.getMicrophones()
      .then((devices) => {
        setDeviceList(devices);
        setDevice(devices[0].deviceId);
      })
      .catch((e) => {
        console.log('get devices error!', e);
        alert('Can not find out devices');
      });
  }, []);

  const handleMicOn = async () => {
    console.log('useClient?.connectionState', useClient?.connectionState);

    const configA = {
      microphoneId: device
    };

    if (useClient?.connectionState === 'CONNECTED') {
      const tempTrack: any = await AgoraRTC.createMicrophoneAudioTrack(configA);
      dispatch(setAudioTrack(tempTrack));
      await useClient?.publish([tempTrack]).then(() => {
        setMicOn(true);
      });
    }
  };

  const handleMicOff = async () => {
    await useClient?.unpublish([audioTrack]).then(() => {
      setMicOn(false);
    });
  };

  const handleDeviceChange = (e: any) => {
    setDevice(e.target.value);
    handleMicOff();
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
            style={{ fontSize: 32, fontWeight: 500 }}
          >
            Input
          </Typography>
          <Typography color={'#C8DCFF'}>
            Select a system audio source to stream
          </Typography>
        </Grid>
        <Grid item xs={12}>
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
            >
              {deviceList.map((item, index) => {
                return (
                  <DeviceItem key={index} value={item.deviceId}>
                    {item.label}
                  </DeviceItem>
                );
              })}
            </DeviceList>
          </FormControl>
        </Grid>
        {isJoined && !micOn && device && (
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
        {isJoined && micOn && device && (
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
          </Grid>
        )}
      </DeviceWrapper>
    </>
  );
}

export default DevicePanel;
