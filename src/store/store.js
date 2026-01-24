import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { apiSlice } from './api/apiSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['auth/loginSuccess'],
            },
        }).concat(apiSlice.middleware),
});

export default store;
