import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import aadharApi from '../api/axiosApi';
import aadharSlice from './aadharSlice';

const persistConfiguration = {
  key: 'root',
  version: 1,
  storage,
};

const rootReducer = combineReducers({
  aadharSlice: aadharSlice.reducer,
  [aadharApi.reducerPath]: aadharApi.reducer, 

})

const persistedReducer = persistReducer(persistConfiguration, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware)=>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(aadharApi.middleware)
});

export const persistor = persistStore(store);

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

