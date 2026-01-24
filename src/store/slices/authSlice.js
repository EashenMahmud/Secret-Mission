import { createSlice } from '@reduxjs/toolkit';
import { mockUsers } from '../../data/mockData';

const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    role: null,
    isRestoring: true,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
            state.isAuthenticated = true;
            state.role = user.role;
            state.isRestoring = false;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.role = null;
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
        },
        finishRestoring: (state) => {
            state.isRestoring = false;
        },
    },
});

export const { loginSuccess, logout, updateUser, finishRestoring } = authSlice.actions;

// Logout thunk remains used internally for clearing storage

// Thunk for logout
export const performLogout = () => (dispatch) => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    dispatch(logout());
};

// Thunk to restore session from localStorage
export const restoreSession = () => (dispatch) => {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
        try {
            const user = JSON.parse(userStr);
            dispatch(loginSuccess({ user, token }));
        } catch (error) {
            // If parsing fails, clear localStorage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            dispatch(finishRestoring());
        }
    } else {
        dispatch(finishRestoring());
    }
};

export default authSlice.reducer;
