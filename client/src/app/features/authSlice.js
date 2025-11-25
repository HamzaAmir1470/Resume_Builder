import { createSlice } from "@reduxjs/toolkit";

const userFromStorage = JSON.parse(localStorage.getItem("user")) || null;
const tokenFromStorage = localStorage.getItem("token") || null;
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: tokenFromStorage,
        user: userFromStorage,
        loading: true,
    },
    reducers: {
        login: (state, action) => {
            state.token = action.payload.token
            state.user = action.payload.user
            try {
                localStorage.setItem('token', action.payload.token || '')
                localStorage.setItem('user', JSON.stringify(action.payload.user || null))
            } catch (e) {
                // ignore storage errors
            }
        },
        logout: (state) => {
            state.token = '',
                state.user = null,
                localStorage.removeItem('token')
            localStorage.removeItem('user')
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        }
    }
})


export const { login, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;