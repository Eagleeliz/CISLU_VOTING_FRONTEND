import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import { authApi } from "../Features/Apis/Auth.APi";
// Create Persist Configuration for auth Slice
import authReducer from "../Features/Auth/AuthSlice";
import { electionApi } from "../Features/Apis/Election.Api";
 const authPersistConfiguration ={
    key: 'auth',
    storage,
    whitelist: ['user','token','isAuthenticated','role']
 }
//  Create A persistent Reducer for the AUTH
const persistedAuthReducer =persistReducer(authPersistConfiguration,authReducer)


export const store = configureStore({
    reducer: {
        [authApi.reducerPath]:authApi.reducer,
        auth: persistedAuthReducer,
        [electionApi.reducerPath] :electionApi.reducer,
      
    },
    middleware: (getDefaultMiddleware)=>
        getDefaultMiddleware({
            serializableCheck: false
        }).concat(authApi.middleware,electionApi.middleware)
})

export const persister = persistStore(store);
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch