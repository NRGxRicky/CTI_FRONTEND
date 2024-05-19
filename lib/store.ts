import { configureStore } from "@reduxjs/toolkit";
import showOpacityContainerReducer from "./features/showOpacityContainerSlide"
import locationSlide from "./features/locationSlide";
import mobileSlide from "./features/mobileSlide";

export const store = configureStore({
    reducer: {
        showOpacityContainerReducer,
        locationSlide,
        mobileSlide
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch