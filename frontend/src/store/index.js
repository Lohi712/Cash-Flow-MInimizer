import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import bankReducer from './bankSlice';
import transactionReducer from './transactionSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        banks: bankReducer,
        transactions: transactionReducer,
    },
});
