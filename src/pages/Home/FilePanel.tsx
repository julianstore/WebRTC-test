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
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseOutlinedIcon from '@mui/icons-material/PauseOutlined';
import StopOutlinedIcon from '@mui/icons-material/StopOutlined';
import SkipNextOutlinedIcon from '@mui/icons-material/SkipNextOutlined';
import SkipPreviousOutlinedIcon from '@mui/icons-material/SkipPreviousOutlined';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/material/styles';
import { createStyles, makeStyles } from '@mui/styles';
import CircleIcon from '@mui/icons-material/Circle';
import AuthContext from '../../contexts/AuthContext';
import { useContext } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  _mpTrack,
  setMPTrack,
  addAudio,
  _audioList
} from '../../store/slices/trackSlice';
import { ToastContainer, toast } from 'react-toastify';

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
    markLabel: {
      color: '#48FFF5 !important'
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [curAudio, setCurAudio] = useState<File>();
  const [position, setPosition] = useState(0);

  const classes = useStyles();
  const authContext = useContext(AuthContext);

  console.log('authContext', authContext);

  const dispatch = useAppDispatch();
  const mpTrack = useAppSelector(_mpTrack);
  const audioList = useAppSelector(_audioList);

  useEffect(() => {
    console.log('MpTrack is updated', mpTrack);

    handlePlay();
    mpTrack?.on('source-state-change', (currentState: AudioSourceState) => {
      if (currentState === 'playing') {
        setIsPlaying(true);
      }
      if (currentState === 'paused') {
        clearInterval(intervalId);
        setPaused(true);
        setIsPlaying(false);
      }
      if (currentState === 'stopped') {
        clearInterval(intervalId);
        setPosition(0);
        dispatch(setMPTrack(null));
        setIsPlaying(false);
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
    dispatch(setMPTrack(tempMPTrack));
  };

  const fileUpload = async (e: any) => {
    dispatch(addAudio(e.target.files[0]));
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
    console.log(useClient?.connectionState);
    clearInterval(intervalId);
    if (useClient?.connectionState !== 'CONNECTED') {
      toast.warning('RTC Client is disconnected, please join!');
    }
    if (useClient?.connectionState === 'CONNECTED' && mpTrack != null) {
      intervalId = setInterval(() => {
        setPosition(mpTrack?.getCurrentTime());
      }, 1000);
      if (paused) {
        mpTrack.resumeProcessAudioBuffer();
        setPaused(false);
      } else {
        await useClient?.publish([mpTrack]).then(() => {
          mpTrack.startProcessAudioBuffer();
          // mpTrack.play();
        });
      }
    }
  };

  const handlePause = async () => {
    console.log(useClient?.connectionState);
    setPaused(true);
    mpTrack.pauseProcessAudioBuffer();
    clearInterval(intervalId);
  };

  const handleStop = async () => {
    if (useClient?.connectionState === 'CONNECTED') {
      await useClient?.unpublish([mpTrack]).then(() => {
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

  const handleDragEnter = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    const fileType = e.dataTransfer.items[0].type;
    // console.log(e);
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    const fileType = e.dataTransfer.items[0].type;
    console.log(e.dataTransfer);
    if (fileType.includes('audio')) {
      dispatch(addAudio(e.dataTransfer.files[0]));
      audioChange(e.dataTransfer.files[0]);
    } else {
      toast.warning('Invalid audio file');
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragEnter}
      onDragOver={handleDragEnter}
      onDrop={handleDrop}
    >
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
                  marks={[
                    {
                      label: mpTrack?.duration
                        ? formatDuration(mpTrack?.duration)
                        : '',
                      value: mpTrack?.duration ? mpTrack?.duration : 0
                    }
                  ]}
                  onChange={(_, value) => {
                    setPosition(value as number);
                    mpTrack?.seekAudioBuffer(value);
                  }}
                  style={{ color: '#48FFF5' }}
                  classes={{
                    thumb: classes.thumb,
                    track: classes.track,
                    rail: classes.rail,
                    markLabel: classes.markLabel
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
            {isPlaying ? (
              <PlayArrowIcon
                className={classes.audioControls}
                onClick={handlePlay}
              />
            ) : (
              <PlayArrowOutlinedIcon
                className={classes.audioControls}
                onClick={handlePlay}
              />
            )}

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
      <ToastContainer
        position="top-right"
        newestOnTop
        style={{ marginTop: 100, zIndex: '99999 !important' }}
      />
    </div>
  );
}

export default FilePanel;
