import { Routes, Route, Navigate } from 'react-router';
import TicketListPage from './pages/TicketListPage';
import TicketDetailPage from './pages/TicketDetailPage';

function App() {
  return (
    <Routes>
      <Route path="/tickets" element={<TicketListPage />} />
      <Route path="/tickets/:id" element={<TicketDetailPage />} />
      <Route path="*" element={<Navigate to="/tickets" replace />} />
    </Routes>
  );
}

export default App;
