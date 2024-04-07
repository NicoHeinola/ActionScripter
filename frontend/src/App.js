import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'styles/app.scss';
import MissingPageView from 'views/MissingPageView';
import NoFileSelectedView from 'views/NoFileSelectedView';
import ScriptEditorView from 'views/ScriptEditorView';

import { Provider } from 'react-redux';
import store from "store/store";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<NoFileSelectedView />} />
          <Route index path='/script-editor' element={<ScriptEditorView />} />
          <Route index path='*' element={<MissingPageView />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
