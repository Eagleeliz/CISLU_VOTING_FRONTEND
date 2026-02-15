import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import { authApi } from "../Features/Apis/Auth.APi";
// Create Persist Configuration for auth Slice
import authReducer from "../Features/Auth/AuthSlice";
import { electionApi } from "../Features/Apis/Election.Api";
import { positionApi } from "../Features/Apis/Position.Api";
import { candidateApplicationApi } from "../Features/Apis/CandidatesApplication.Api";
import { candidateApi } from "../Features/Apis/Candidate.Api";
import { votesApi } from "../Features/Apis/Vote.Api";
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
        [positionApi.reducerPath]: positionApi.reducer,
        [candidateApplicationApi.reducerPath]: candidateApplicationApi.reducer,
        [candidateApi.reducerPath]: candidateApi.reducer,
        [votesApi.reducerPath]: votesApi.reducer,
      
    },
    middleware: (getDefaultMiddleware)=>
        getDefaultMiddleware({
            serializableCheck: false
        }).concat(authApi.middleware,electionApi.middleware,positionApi.middleware,candidateApplicationApi.middleware,candidateApi.middleware, votesApi.middleware)
})

export const persister = persistStore(store);
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch