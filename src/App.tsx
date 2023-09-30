import { BrowserRouter } from 'react-router-dom';
import AppLayout from './layout/app-layout.tsx';

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <h1>App</h1>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
