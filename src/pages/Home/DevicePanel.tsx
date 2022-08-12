import { useEffect, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { createStyles, makeStyles } from '@mui/styles';
import MicOffTwoToneIcon from '@mui/icons-material/MicOffTwoTone';
import MicTwoToneIcon from '@mui/icons-material/MicTwoTone';

const useStyles = makeStyles(() =>
  createStyles({
    deviceList: {
      background: 'rgba(72, 255, 245, 0.05) !important',
      border: '1.5px solid #48FFF5',
      color: 'white !important',
      borderRadius: '42px !important'
    },
    diviceItem: {
      background: 'rgb(0, 0, 0) !important',
      color: 'white !important'
    },

    diviceItem1: {
      background: 'rgb(0, 0, 0) !important',
      color: 'white !important'
    },
    dropDownIcon: {
      marginRight: 15,
      color: '#48FFF5'
    },
    micOn: {
      border: '50% solid #48FFF5',
      color: '#48FFF5'
    },
    micOnButton: {
      border: '1.5px solid #48FFF5',
      background: 'rgba(72, 255, 245, 0.05) !important',
      color: '#48FFF5',
      cursor: 'pointer'
    },
    micOff: {
      border: '50% solid #FF1F70',
      color: '#FF1F70'
    },
    micOffButton: {
      border: '1.5px solid #FF1F70',
      background: 'rgba(72, 255, 245, 0.05) !important',
      color: '#FF1F70',
      cursor: 'pointer'
    },
    micDescription: {
      marginTop: '20px !important',
      color: '#C8DCFF',
      fontStyle: 'normal',
      fontWeight: 400,
      fontSize: 15
    },
    devicePanel: {
      borderRight: '2px solid rgba(72, 255, 245, 0.25)',
      paddingRight: 50
    }
  })
);

function DevicePanel(props: any) {
  const { useClient, isJoined } = props;
  const [deviceList, setDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [audioTrack, setAudioTrack] = useState<any>(null);
  const [device, setDevice] = useState('');
  const [micOn, setMicOn] = useState(false);

  const classes = useStyles();

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
    console.log('useClient.connectionState', useClient.connectionState);

    const configA = {
      microphoneId: device
    };

    if (useClient.connectionState === 'CONNECTED') {
      const tempTrack: any = await AgoraRTC.createMicrophoneAudioTrack(configA);
      setAudioTrack(tempTrack);
      await useClient.publish([audioTrack]).then(() => {
        setMicOn(!micOn);
      });
    }
  };

  const handleMicOff = async () => {
    await useClient.unpublish([audioTrack]).then(() => {
      setMicOn(!micOn);
    });
  };

  const handleDeviceChange = (e: any) => {
    setDevice(e.target.value);
  };

  return (
    <>
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="stretch"
        spacing={1}
        className={classes.devicePanel}
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
            <Select
              value={device}
              onChange={handleDeviceChange}
              displayEmpty
              className={classes.deviceList}
              IconComponent={() => (
                <ExpandMoreIcon className={classes.dropDownIcon} />
              )}
              MenuProps={{ classes: { paper: classes.diviceItem } }}
              fullWidth
            >
              {deviceList.map((item, index) => {
                return (
                  <MenuItem
                    key={index}
                    value={item.deviceId}
                    className={classes.diviceItem1}
                  >
                    {item.label}
                  </MenuItem>
                );
              })}
            </Select>
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
            <Avatar className={classes.micOnButton} onClick={handleMicOn}>
              <MicTwoToneIcon className={classes.micOn} />
            </Avatar>
            <Typography className={classes.micDescription}>
              Input source is broacasting. Click to mute.
            </Typography>
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
            <Avatar className={classes.micOffButton} onClick={handleMicOff}>
              <MicOffTwoToneIcon className={classes.micOff} />
            </Avatar>
            <Typography className={classes.micDescription}>
              Input source is muted. Click to broadcast.
            </Typography>
          </Grid>
        )}
      </Grid>
    </>
  );
}

export default DevicePanel;
