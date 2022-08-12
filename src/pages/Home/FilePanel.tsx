import { Grid } from '@mui/material';
import Button from '@mui/material/Button';
import { Typography, Box } from '@mui/material';
import { useRef, useEffect, useState } from 'react';
import AgoraRTC, { AudioSourceState } from 'agora-rtc-sdk-ng';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Slider from '@mui/material/Slider';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import PauseOutlinedIcon from '@mui/icons-material/PauseOutlined';
import StopOutlinedIcon from '@mui/icons-material/StopOutlined';
import SkipNextOutlinedIcon from '@mui/icons-material/SkipNextOutlined';
import SkipPreviousOutlinedIcon from '@mui/icons-material/SkipPreviousOutlined';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/material/styles';
import { createStyles, makeStyles } from '@mui/styles';
import CircleIcon from '@mui/icons-material/Circle';

var intervalId: any = null;

const TinyText = styled(Typography)({
  fontSize: '0.75rem',
  fontWeight: 500,
  letterSpacing: 0.2,
  color: '#48FFF5'
});

const useStyles = makeStyles(() =>
  createStyles({
    add: {
      background: 'rgba(0, 0, 0, 0.05) !important',
      border: '1.5px solid #48FFF5 !important',
      //   borderBottom: '0px !important',
      color: '#48FFF5 !important',
      borderRadius: '10px 10px 0px 0px !important',
      height: '40px !important',
      display: 'flex',
      justifyContent: 'space-between !important',
      textTransform: 'none'
    },
    audioList: {
      border: '1.5px solid #48FFF5',
      color: '#48FFF5',
      borderRadius: '0px 0px 10px 10px !important',
      padding: '0px !important'
    },
    audioListItem: {
      height: '40px !important',
      borderTop: '1.5px solid #48FFF5',
      '&.Mui-selected': {
        background: 'rgba(72, 255, 245, 0.05) !important'
      }
    },
    selectedMark: {
      fontSize: '15px !important',
      color: '#48FFF5'
    },
    thumb: {
      background: 'rgba(0,0,0,0) !important'
    },
    rail: {
      background: '#464646 !important'
    },
    track: {
      background: '#48FFF5 !important'
    },
    audioControls: {
      color: '#48FFF5 !important',
      '&:hover': {
        cursor: 'pointer'
      }
    },
    filePanel: {
      paddingLeft: 50
    }
  })
);

function FilePanel(props: any) {
  const { useClient } = props;
  const fileInput = useRef<HTMLInputElement>(null);
  const [paused, setPaused] = useState(false);
  const [mpTrack, setMPTrack] = useState<any>(null);
  const [audioList, setAudioList] = useState<File[]>([]);
  const [curAudio, setCurAudio] = useState<File>();
  const [position, setPosition] = useState(0);

  const classes = useStyles();

  useEffect(() => {
    console.log('MpTrack is updated', mpTrack);

    handlePlay();
    mpTrack?.on('source-state-change', (currentState: AudioSourceState) => {
      if (currentState === 'paused') {
        clearInterval(intervalId);
        setPaused(true);
      }
      if (currentState === 'stopped') {
        clearInterval(intervalId);
        setPosition(0);
        setMPTrack(null);
      }
    });
    // eslint-disable-next-line
  }, [mpTrack]);

  const audioChange = async (newAudio: any) => {
    mpTrack?.stopProcessAudioBuffer();
    clearInterval(intervalId);
    var fileConfig = {
      // can also be a https link
      source: newAudio
    };
    const tempMPTrack = await AgoraRTC.createBufferSourceAudioTrack(fileConfig);
    setCurAudio(newAudio);
    setMPTrack(tempMPTrack);
  };

  const fileUpload = async (e: any) => {
    setAudioList((list) => [...list, e.target.files[0]]);
    audioChange(e.target.files[0]);
  };

  const handleNext = async () => {
    if (curAudio) {
      await audioChange(
        audioList.indexOf(curAudio) + 1 < audioList.length
          ? audioList[audioList.indexOf(curAudio) + 1]
          : audioList[0]
      );
    }
  };

  const handlePrev = async () => {
    if (curAudio) {
      await audioChange(
        audioList.indexOf(curAudio) - 1 >= 0
          ? audioList[audioList.indexOf(curAudio) - 1]
          : audioList[audioList.length - 1]
      );
    }
  };

  const handlePlay = async () => {
    console.log(useClient.connectionState);
    clearInterval(intervalId);
    if (useClient.connectionState === 'CONNECTED' && mpTrack != null) {
      intervalId = setInterval(() => {
        setPosition(mpTrack?.getCurrentTime());
      }, 1000);
      if (paused) {
        mpTrack.resumeProcessAudioBuffer();
        setPaused(false);
      } else {
        await useClient.publish([mpTrack]).then(() => {
          mpTrack.startProcessAudioBuffer();
          // mpTrack.play();
        });
      }
    }
  };

  const handlePause = async () => {
    console.log(useClient.connectionState);
    setPaused(true);
    mpTrack.pauseProcessAudioBuffer();
    clearInterval(intervalId);
  };

  const handleStop = async () => {
    if (useClient.connectionState === 'CONNECTED') {
      await useClient.unpublish([mpTrack]).then(() => {
        mpTrack.stopProcessAudioBuffer();
        setPosition(0);
        setMPTrack(null);
        clearInterval(intervalId);
      });
    }
  };

  function formatDuration(value: number) {
    const minute = Math.floor(value / 60);
    const secondLeft = value - minute * 60;
    return `${minute}:${
      secondLeft < 10 ? `0${secondLeft.toFixed(0)}` : secondLeft.toFixed(0)
    }`;
  }

  return (
    <>
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="stretch"
        spacing={1}
        className={classes.filePanel}
      >
        <Grid item xs={12}>
          <Typography
            color={'#C8DCFF'}
            style={{ fontSize: 32, fontWeight: 500 }}
          >
            MP3 playlist
          </Typography>
          <Typography color={'#C8DCFF'}>
            Drag and drop or hit plus to add
          </Typography>
        </Grid>
        <Grid item xs={12} container>
          <Grid item xs={8} container>
            <Grid item xs={12}>
              <Button
                variant="contained"
                className={classes.add}
                onClick={() => fileInput?.current?.click()}
                fullWidth
              >
                <Typography>Track Name</Typography>
                <AddIcon />
              </Button>
              <input
                ref={fileInput}
                type="file"
                style={{ display: 'none' }}
                onChange={fileUpload}
              />
            </Grid>
            <Grid item xs={12}>
              {audioList.length > 0 && (
                <List className={classes.audioList}>
                  {audioList.map((item: any, index: any) => {
                    return (
                      <ListItem
                        disablePadding
                        key={index}
                        className={classes.audioListItem}
                      >
                        <ListItemButton selected={item === curAudio}>
                          {item === curAudio && (
                            <ListItemIcon style={{ minWidth: 30 }}>
                              <CircleIcon className={classes.selectedMark} />
                            </ListItemIcon>
                          )}
                          <ListItemText
                            primary={
                              <Typography
                                style={{
                                  color: '#C8DCFF',
                                  fontWeight: 300,
                                  fontSize: '16px'
                                }}
                              >
                                {item?.name}
                              </Typography>
                            }
                            onClick={async () => {
                              audioChange(item);
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Grid>
          </Grid>
          <Grid item xs={8} style={{ marginTop: 20 }}>
            {curAudio && audioList.length !== 0 && (
              <>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <TinyText>
                    {curAudio.name} - {formatDuration(position)}
                  </TinyText>
                </Box>
                <Slider
                  size="small"
                  value={position}
                  aria-label="Small"
                  step={1}
                  min={0}
                  max={mpTrack?.duration}
                  marks={[mpTrack?.duration].map((i) => ({
                    label: formatDuration(mpTrack?.duration),
                    value: i
                  }))}
                  onChange={(_, value) => {
                    setPosition(value as number);
                    mpTrack?.seekAudioBuffer(value);
                  }}
                  style={{ color: '#48FFF5' }}
                  classes={{
                    thumb: classes.thumb,
                    track: classes.track,
                    rail: classes.rail,
                    mark: classes.rail,
                    valueLabel: classes.track
                  }}
                />
              </>
            )}
          </Grid>
          <Grid item xs={8} container direction="row" justifyContent={'center'}>
            <SkipPreviousOutlinedIcon
              className={classes.audioControls}
              onClick={handlePrev}
            />
            <PlayArrowOutlinedIcon
              className={classes.audioControls}
              onClick={handlePlay}
            />
            <PauseOutlinedIcon
              className={classes.audioControls}
              onClick={handlePause}
            />
            <StopOutlinedIcon
              className={classes.audioControls}
              onClick={handleStop}
            />

            <SkipNextOutlinedIcon
              className={classes.audioControls}
              onClick={handleNext}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default FilePanel;
