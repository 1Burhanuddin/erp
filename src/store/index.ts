
import { configureStore } from '@reduxjs/toolkit';
import storeReducer from './slices/storeSlice';
import cartReducer from './slices/cartSlice';

export const store = configureStore({
    reducer: {
        store: storeReducer,
        cart: cartReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
