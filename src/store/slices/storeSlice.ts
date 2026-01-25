
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Store {
    id: string;
    name: string;
    is_active: boolean;
}

interface StoreState {
    activeStoreId: string | null;
    availableStores: Store[];
    isLoading: boolean;
}

// Helper to get initial store from localStorage
const getInitialActiveStore = (): string | null => {
    try {
        return localStorage.getItem('erp_active_store_id');
    } catch (e) {
        return null;
    }
};

const initialState: StoreState = {
    activeStoreId: getInitialActiveStore(),
    availableStores: [],
    isLoading: false,
};

const storeSlice = createSlice({
    name: 'store',
    initialState,
    reducers: {
        setActiveStoreId: (state, action: PayloadAction<string | null>) => {
            state.activeStoreId = action.payload;
            if (action.payload) {
                localStorage.setItem('erp_active_store_id', action.payload);
            } else {
                localStorage.removeItem('erp_active_store_id');
            }
        },
        setAvailableStores: (state, action: PayloadAction<Store[]>) => {
            state.availableStores = action.payload;
            // If active store is not in available stores (and we have stores), default to the first one
            if (state.availableStores.length > 0) {
                const isActiveValid = state.availableStores.some(s => s.id === state.activeStoreId);
                if (!isActiveValid) {
                    state.activeStoreId = state.availableStores[0].id;
                    localStorage.setItem('erp_active_store_id', state.availableStores[0].id);
                }
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
    },
});

export const { setActiveStoreId, setAvailableStores, setLoading } = storeSlice.actions;
export default storeSlice.reducer;
