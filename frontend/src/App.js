import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function App() {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Tab') {
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  return (
    <Provider store={store}>
      <BrowserRouter>
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
      </BrowserRouter>
    </Provider>
  );
}

export default App;
