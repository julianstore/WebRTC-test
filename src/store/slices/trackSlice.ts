import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IAgoraRTCClient } from 'agora-rtc-sdk-ng';

export interface TrackState {
  audioList: File[];
  mpTrack: any;
  audioTrack: any;
  rtcClient: any;
}

const initTrackState: TrackState = {
  audioList: [],
  mpTrack: null,
  audioTrack: null,
  rtcClient: null
};

const trackSlice = createSlice({
  name: 'track',
  initialState: initTrackState,

  reducers: {
    addAudio(state: TrackState, action: PayloadAction<File>) {
      state.audioList = [action.payload, ...state.audioList];
    },
    removeAudio(state: TrackState, action: PayloadAction<number>) {
      state.audioList.splice(action.payload, 1);
    },
    setAudioList(state: TrackState, action: PayloadAction<File[]>) {
      state.audioList = action.payload;
    },
    setMPTrack(state: TrackState, action: PayloadAction<any>) {
      state.mpTrack = action.payload;
    },
    setAudioTrack(state: TrackState, action: PayloadAction<any>) {
      state.audioTrack = action.payload;
    },
    setRTCClient(state: TrackState, action: PayloadAction<IAgoraRTCClient>) {
      console.log('setRTCClient:', action.payload);
      state.rtcClient = action.payload;
    }
  }
  //   extraReducers: (builder) => {
  //     builder.addCase(getUsers.fulfilled, (state, action) => {
  //       state.userList = action.payload;
  //     });
  //   }
});

// here's you a reducer
export default trackSlice.reducer;

export const {
  addAudio,
  removeAudio,
  setMPTrack,
  setAudioTrack,
  setRTCClient,
  setAudioList
} = trackSlice.actions;

export const _audioList = (state: any) => state.track.audioList;
export const _mpTrack = (state: any) => state.track.mpTrack;
export const _audioTrack = (state: any) => state.track.audioTrack;
export const _rtcClient = (state: any) => state.track.rtcClient;
