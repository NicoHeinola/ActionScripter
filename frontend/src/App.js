import { HashRouter, Routes, Route } from 'react-router-dom';
import 'styles/app.scss';
import MissingPageView from 'views/MissingPageView';
import NoFileSelectedView from 'views/NoFileSelectedView';
import ScriptEditorView from 'views/ScriptEditorView';

import { Provider } from 'react-redux';
import store from "store/store";
import SaveManager from 'components/save/SaveManager';
import NavigationMenu from 'components/navigation/NavigationMenu';
import SettingsPageView from 'views/SettingsPageView';
import HotkeyManager from 'components/hotkey/HotkeyManager';
import { useEffect } from 'react';
import { ring } from 'ldrs';

import appAPI from "apis/appAPI";
import { appWindow } from '@tauri-apps/api/window';

ring.register()

function App() {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Tab') {
        event.preventDefault();
      }
    };

    const onContextMenu = (event) => {
      event.preventDefault();
    }

    const onWindowClose = async () => {
      appAPI.quitBackend();
      appWindow.close();
    };

    const unlisten = appWindow.listen('tauri://close-requested', onWindowClose);

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', onContextMenu);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', onContextMenu);
      unlisten.then((f) => f());
    };
  }, []);

  return (
    <Provider store={store}>
      <HashRouter>
        <div className='app'>
          <SaveManager />
          <HotkeyManager />
          <NavigationMenu />
          <Routes>
            <Route path='/' element={<NoFileSelectedView />} />
            <Route index path='/script-editor' element={<ScriptEditorView />} />
            <Route index path='*' element={<MissingPageView />} />
            <Route index path='/settings' element={<SettingsPageView />} />
          </Routes>
        </div>
      </HashRouter>
    </Provider>
  );
}

export default App;
