import { configureStore } from '@reduxjs/toolkit';
import actionsReducer from './reducers/actionsReducer';
import actionScriptReducer from './reducers/actionScriptReducer';
import settingsReducer from './reducers/settingsReducer';

const store = configureStore({
    reducer: {
        actions: actionsReducer,
        actionScript: actionScriptReducer,
        settings: settingsReducer,
    },
});

export default store;
