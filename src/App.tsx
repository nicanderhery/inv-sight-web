import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes.tsx';
import AppLayout from './layout/app-layout.tsx';

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <AppRoutes />
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
