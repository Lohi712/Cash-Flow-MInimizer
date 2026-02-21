import { createSlice } from '@reduxjs/toolkit';

const bankSlice = createSlice({
    name: 'banks',
    initialState: {
        list: [],
        loading: false,
        error: null,
    },
    reducers: {
        setBanks: (state, action) => { state.list = action.payload; state.loading = false; },
        addBank: (state, action) => { state.list.unshift(action.payload); },
        removeBank: (state, action) => {
            state.list = state.list.filter((b) => b._id !== action.payload);
        },
        setLoading: (state, action) => { state.loading = action.payload; },
        setError: (state, action) => { state.error = action.payload; state.loading = false; },
    },
});

export const { setBanks, addBank, removeBank, setLoading, setError } = bankSlice.actions;
export default bankSlice.reducer;
