import { configureStore, createSlice } from '@reduxjs/toolkit';

const initialAuthState = {
  token: null,
  user: null,
};

const loadAuthState = () => {
  try {
    const raw = localStorage.getItem('kauvery-auth');
    if (!raw) return initialAuthState;
    return JSON.parse(raw);
  } catch (err) {
    return initialAuthState;
  }
};

const saveAuthState = (state) => {
  try {
    localStorage.setItem('kauvery-auth', JSON.stringify(state.auth));
  } catch (err) {
    // ignore write failures
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    setAuth(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user || null;
    },
    clearAuth(state) {
      state.token = null;
      state.user = null;
    }
  }
});

export const { setAuth, clearAuth } = authSlice.actions;

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
  preloadedState: {
    auth: loadAuthState()
  }
});

store.subscribe(() => saveAuthState(store.getState()));

export default store;
