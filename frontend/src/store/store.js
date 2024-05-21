import { configureStore } from '@reduxjs/toolkit';
import actionScriptReducer from './reducers/actionScriptReducer';
import settingsReducer from './reducers/settingsReducer';

const store = configureStore({
    reducer: {
        actionScript: actionScriptReducer,
        settings: settingsReducer,
    },
});

export default store;
