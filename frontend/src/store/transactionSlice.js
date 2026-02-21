import { createSlice } from '@reduxjs/toolkit';

const transactionSlice = createSlice({
    name: 'transactions',
    initialState: {
        list: [],
        loading: false,
        error: null,
    },
    reducers: {
        setTransactions: (state, action) => { state.list = action.payload; state.loading = false; },
        addTransaction: (state, action) => { state.list.unshift(action.payload); },
        removeTransaction: (state, action) => {
            state.list = state.list.filter((t) => t._id !== action.payload);
        },
        setLoading: (state, action) => { state.loading = action.payload; },
        setError: (state, action) => { state.error = action.payload; state.loading = false; },
    },
});

export const { setTransactions, addTransaction, removeTransaction, setLoading, setError } = transactionSlice.actions;
export default transactionSlice.reducer;
