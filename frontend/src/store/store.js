import { configureStore } from '@reduxjs/toolkit';
import actionsReducer from './reducers/actionsReducer';
import actionScriptReducer from './reducers/actionScriptReducer';

const store = configureStore({
    reducer: {
        actions: actionsReducer,
        actionScript: actionScriptReducer
    },
});

export default store;
