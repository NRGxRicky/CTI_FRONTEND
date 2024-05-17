import { configureStore } from "@reduxjs/toolkit";
import showOpacityContainerReducer from "./features/showOpacityContainerSlide"
import locationSlide from "./features/locationSlide";

export const store = configureStore({
    reducer: {
        showOpacityContainerReducer,
        locationSlide
        
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch