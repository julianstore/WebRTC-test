import { useRef, useEffect, useState, useCallback } from 'react';
import AgoraRTC, { AudioSourceState } from 'agora-rtc-sdk-ng';
import { FileDrop } from 'react-file-drop';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { Grid } from '@mui/material';
import Button from '@mui/material/Button';
import { Typography, Box } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Slider from '@mui/material/Slider';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import StopOutlined from '@mui/icons-material/StopOutlined';
import PauseOutlinedIcon from '@mui/icons-material/PauseOutlined';
import SkipNextOutlinedIcon from '@mui/icons-material/SkipNextOutlined';
import SkipPreviousOutlinedIcon from '@mui/icons-material/SkipPreviousOutlined';
import AddIcon from '@mui/icons-material/Add';
import CircleIcon from '@mui/icons-material/Circle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  _mpTrack,
  _rtcClient,
  setRTCClient,
  setMPTrack,
  addAudio,
  removeAudio,
  _audioList
} from '../../store/slices/trackSlice';

var intervalId: any = null;

const TinyText = styled(Typography)({
  fontFamily: 'Poppins !important',
  fontWeight: '500 !important',
  fontSize: '16px !important',
  lineHeight: '16.64px !important',
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
  minHeight: '40px !important',
  borderTop: '1.5px solid #48FFF5',
  '&.Mui-selected': {
    background: 'rgba(72, 255, 245, 0.05) !important'
  }
});

const SelectMark = styled(CircleIcon)({
  fontSize: '15px !important',
  color: '#48FFF5'
});

const RemoveMark = styled(DeleteOutlineIcon)({
  fontSize: '22px !important',
  color: '#48FFF5'
});

const TrackName = styled(Typography)({
  display: 'block',
  width: '300px',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  color: '#C8DCFF',
  fontWeight: 300,
  fontSize: '16px'
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

const FileListWrapper = styled(Grid)`
  border-left: 2px solid rgba(72, 255, 245, 0.25);
  @media only screen and (max-width: 900px) {
    border: 0px;
  }
`;

function FilePanel() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [paused, setPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [curAudio, setCurAudio] = useState<File>();
  const [position, setPosition] = useState(0);

  const dispatch = useAppDispatch();
  const mpTrack = useAppSelector(_mpTrack);
  const audioList = useAppSelector(_audioList);
  const rtcClient = useAppSelector(_rtcClient);

  const isConnected = useCallback(() => {
    return rtcClient?.connectionState === 'CONNECTED'
  }, [rtcClient?.connectionState]);

  const isDisConnected = useCallback(() => {
    return rtcClient?.connectionState === 'DISCONNECTED'
  }, [rtcClient?.connectionState]);

  const updateRTCClient = useCallback((_rtcClient: any) => {
    dispatch(setRTCClient(_rtcClient));
  }, [dispatch]);

  useEffect(() => {
    if (isConnected()) {
      handlePlay();
    }
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
        setIsPlaying(false);
        // dispatch(setMPTrack(null));
        // handleNext();
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
    (fileInput.current as any).value = null;
    setCurAudio(newAudio);
    dispatch(setMPTrack(tempMPTrack));
  };

  const removeAudioHandler = async (index: number, isSelected: boolean) => {
    if (isConnected() && mpTrack != null && isSelected) {
      (fileInput.current as any).value = null;
      mpTrack.stopProcessAudioBuffer();
      dispatch(removeAudio(index));
      if (audioList.length > 1) {
        await handleNext();
      } else {
        dispatch(setMPTrack(null));
        setCurAudio(undefined);
      }
    } else {
      dispatch(removeAudio(index));
    }
  }

  const fileUpload = async (files: any) => {
    var file = files[0];
    if (file.type !== 'audio/mpeg') {
      toast.error('Not Audio format, please upload audio file!');
    } else {
      dispatch(addAudio(file));
      audioChange(file);
    }
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
    clearInterval(intervalId);
    if (isDisConnected()) {
      toast.warning('RTC Client is not connected, please join!');
    }
    if (isConnected() && mpTrack != null) {
      intervalId = setInterval(() => {
        setPosition(mpTrack?.getCurrentTime());
      }, 1000);
      if (paused) {
        mpTrack.resumeProcessAudioBuffer();
        setPaused(false);
      } else {
        if (isPlaying) {
            mpTrack.stopProcessAudioBuffer();
        } else {
          await rtcClient?.publish([mpTrack]).then(() => {
            mpTrack.startProcessAudioBuffer();
            updateRTCClient(rtcClient);
            // mpTrack.play();
          });
        }
      }
    }
  };

  const handlePause = async () => {
    if (curAudio) {
      setPaused(true);
      setIsPlaying(false);
      mpTrack.pauseProcessAudioBuffer();
      clearInterval(intervalId);
    }
  };

  //   const handleStop = async () => {
  //     if (rtcClient?.connectionState === 'CONNECTED') {
  //       await rtcClient?.unpublish([mpTrack]).then(() => {
  //         mpTrack.stopProcessAudioBuffer();
  //          updateRTCClient(rtcClient);
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

  return (
    <FileDrop
      onDrop={(event) => fileUpload(event)}
    >
      <FileListWrapper
        container
        direction="row"
        justifyContent="center"
        alignItems="stretch"
        spacing={1}
        sx={{ paddingLeft: { xs: '0px', md: '50px'} }}
      >
        <Grid item xs={12}>
          <Typography
            color={'#C8DCFF'}
            style={{ fontSize: 32, fontWeight: 500, fontFamily: 'Poppins', lineHeight: '33.28px' }}
          >
            MP3 playlist
          </Typography>
          <Typography
            color={'#C8DCFF'}
            style={{ fontSize: 16, fontWeight: 400, fontFamily: 'Poppins', lineHeight: '16.64px' }}
          >
            Drag and drop or hit plus to add
          </Typography>
        </Grid>
        <Grid item xs={12} container style={{ marginTop: '20px'}}>
          <Grid item xs={12} md={8} container>
            <Grid item xs={12}>
              <AddBtn
                variant="contained"
                onClick={() => fileInput?.current?.click()}
                fullWidth
                disabled={isDisConnected()}
                tabIndex={6}
              >
                <Typography style={{ fontSize: 16, fontWeight: 500, fontFamily: 'Poppins', lineHeight: '16.64px' }}>Track Name</Typography>
                <AddIcon />
              </AddBtn>
              <input
                ref={fileInput}
                type="file"
                accept="audio/*"
                style={{ display: 'none' }}
                onChange={(e) => fileUpload(e.target.files)}
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
                            primary={<TrackName
                              color={'#C8DCFF'}
                              style={{
                                fontSize: 16,
                                fontWeight: 300,
                                fontFamily: 'Poppins',
                                lineHeight: '16.64px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                width: '100%'
                              }}
                              >
                                {item?.name}
                                </TrackName>
                                }
                            onClick={async () => {
                              audioChange(item);
                            }}
                          />

                          <ListItemIcon
                            style={{ minWidth: 22 }}
                            onClick={async () => {
                              removeAudioHandler(index, item === curAudio);
                            }}
                            >
                            <RemoveMark />
                          </ListItemIcon>
                        </ListItemButton>
                      </AudioListItem>
                    );
                  })}
                </AudioList>
              )}
            </Grid>
          </Grid>
          <Grid item xs={12} md={8} style={{ marginTop: 20 }}>
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
                    {curAudio.name.substring(0, 40)} -{' '}
                    {formatDuration(position)}
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
          <Grid item xs={12} md={8} container direction="row" justifyContent={'center'}>
            <SkipPreviousOutlinedIcon
              style={{
                color: '#48FFF5',
                cursor: 'pointer'
              }}
              onClick={handlePrev}
            />
            {isPlaying ? (
              <StopOutlined
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
      </FileListWrapper>
    </FileDrop>
  );
}

export default FilePanel;
