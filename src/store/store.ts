import { configureStore } from '@reduxjs/toolkit';
import { createBrowserHistory } from 'history';
import rootReducer from './rootReducer';

export const history = createBrowserHistory({
  //   getUserConfirmation() {}
});

const store = configureStore({
  reducer: rootReducer(history),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

// Infer the `AppState` and `AppDispatch` types from the store itself
export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
// export type AppThunk = ThunkAction<void, RootState, null, Action<string>>;
export default store;
