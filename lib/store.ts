import { configureStore } from "@reduxjs/toolkit";
import showOpacityContainerReducer from "./features/showOpacityContainerSlide"

export const store = configureStore({
    reducer: {
       showOpacityContainerReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch