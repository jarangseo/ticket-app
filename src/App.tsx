import { Routes, Route, Navigate } from 'react-router';
import TicketListPage from './pages/TicketListPage';
import TicketDetailPage from './pages/TicketDetailPage';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <>
      <Routes>
        <Route path="/tickets" element={<TicketListPage />} />
        <Route path="/tickets/:id" element={<TicketDetailPage />} />
        <Route path="*" element={<Navigate to="/tickets" replace />} />
      </Routes>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}

export default App;
