import { combineReducers } from '@reduxjs/toolkit';
import trackReducer from './slices/trackSlice';

import { connectRouter } from 'connected-react-router';

const rootReducer = (history: any) =>
  combineReducers({
    router: connectRouter(history),
    track: trackReducer
  });

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
