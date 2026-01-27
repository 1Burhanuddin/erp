import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    color?: string; // Variant example
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;
}

const initialState: CartState = {
    items: [],
    isOpen: false
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<CartItem>) => {
            const existingItem = state.items.find(
                item => item.productId === action.payload.productId && item.color === action.payload.color
            );
            if (existingItem) {
                existingItem.quantity += action.payload.quantity;
            } else {
                state.items.push(action.payload);
            }
            state.isOpen = true; // Open cart/drawer when adding
        },
        removeFromCart: (state, action: PayloadAction<{ productId: string; color?: string }>) => {
            state.items = state.items.filter(
                item => !(item.productId === action.payload.productId && item.color === action.payload.color)
            );
        },
        updateQuantity: (state, action: PayloadAction<{ productId: string; color?: string; quantity: number }>) => {
            const item = state.items.find(
                item => item.productId === action.payload.productId && item.color === action.payload.color
            );
            if (item) {
                item.quantity = Math.max(1, action.payload.quantity);
            }
        },
        clearCart: (state) => {
            state.items = [];
        },
        toggleCart: (state) => {
            state.isOpen = !state.isOpen;
        }
    },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, toggleCart } = cartSlice.actions;
export default cartSlice.reducer;
