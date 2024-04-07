import { configureStore } from '@reduxjs/toolkit';
import actionsReducer from './reducers/actionsReducer';

const store = configureStore({
    reducer: {
        actions: actionsReducer,
    },
});

export default store;
