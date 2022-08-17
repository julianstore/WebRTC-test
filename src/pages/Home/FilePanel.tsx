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
// import StopOutlinedIcon from '@mui/icons-material/StopOutlined';
import SkipNextOutlinedIcon from '@mui/icons-material/SkipNextOutlined';
import SkipPreviousOutlinedIcon from '@mui/icons-material/SkipPreviousOutlined';
import AddIcon from '@mui/icons-material/Add';
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
import styled from 'styled-components';

var intervalId: any = null;

const TinyText = styled(Typography)({
  fontSize: '0.75rem',
  fontWeight: 500,
  letterSpacing: 0.2,
  color: '#48FFF5'
});

const AddBtn = styled(Button)({
  background: 'rgba(0, 0, 0, 0.05) !important',
  border: '1.5px solid #48fff5 !important',
  color: '#48fff5 !important',
  borderRadius: '10px 10px 0px 0px !important',
  height: '40px !important',
  display: 'flex',
  justifyContent: 'space-between !important',
  textTransform: 'none'
});

const AudioList = styled(List)({
  border: '1.5px solid #48fff5',
  color: '#48fff5',
  borderRadius: '0px 0px 10px 10px !important',
  padding: '0px !important'
});

const AudioListItem = styled(ListItem)({
  height: '40px !important',
  borderTop: '1.5px solid #48FFF5',
  '&.Mui-selected': {
    background: 'rgba(72, 255, 245, 0.05) !important'
  }
});

const SelectMark = styled(CircleIcon)({
  fontSize: '15px !important',
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

function FilePanel(props: any) {
  const { useClient } = props;
  const fileInput = useRef<HTMLInputElement>(null);
  const [paused, setPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [curAudio, setCurAudio] = useState<File>();
  const [position, setPosition] = useState(0);

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
        handleNext();
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
      toast.warning('RTC Client is not connected, please join!');
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
    setIsPlaying(false);
    mpTrack.pauseProcessAudioBuffer();
    clearInterval(intervalId);
  };

  //   const handleStop = async () => {
  //     if (useClient?.connectionState === 'CONNECTED') {
  //       await useClient?.unpublish([mpTrack]).then(() => {
  //         mpTrack.stopProcessAudioBuffer();

  //       });
  //     }
  //   };

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
        style={{ paddingLeft: 50 }}
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
              <AddBtn
                variant="contained"
                onClick={() => fileInput?.current?.click()}
                fullWidth
              >
                <Typography>Track Name</Typography>
                <AddIcon />
              </AddBtn>
              <input
                ref={fileInput}
                type="file"
                style={{ display: 'none' }}
                onChange={fileUpload}
              />
            </Grid>
            <Grid item xs={12}>
              {audioList.length > 0 && (
                <AudioList>
                  {audioList.map((item: any, index: any) => {
                    return (
                      <AudioListItem disablePadding key={index}>
                        <ListItemButton selected={item === curAudio}>
                          {item === curAudio && (
                            <ListItemIcon style={{ minWidth: 30 }}>
                              <SelectMark />
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
                      </AudioListItem>
                    );
                  })}
                </AudioList>
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
                <TrackSlider
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
                />
              </>
            )}
          </Grid>
          <Grid item xs={8} container direction="row" justifyContent={'center'}>
            <SkipPreviousOutlinedIcon
              style={{
                color: '#48FFF5',
                cursor: 'pointer'
              }}
              onClick={handlePrev}
            />
            {isPlaying ? (
              <PlayArrowIcon
                style={{
                  color: '#48FFF5',
                  cursor: 'pointer'
                }}
                onClick={handlePlay}
              />
            ) : (
              <PlayArrowOutlinedIcon
                style={{
                  color: '#48FFF5',
                  cursor: 'pointer'
                }}
                onClick={handlePlay}
              />
            )}

            <PauseOutlinedIcon
              style={{
                color: '#48FFF5',
                cursor: 'pointer'
              }}
              onClick={handlePause}
            />
            {/* <StopOutlinedIcon
              style={{
                color: '#48FFF5',
                cursor: 'pointer'
              }}
              onClick={handleStop}
            /> */}

            <SkipNextOutlinedIcon
              style={{
                color: '#48FFF5',
                cursor: 'pointer'
              }}
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
