import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import ClippingPreview from './components/ClippingPreview';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLayout />} />
        <Route path="/clip/:clipId" element={<ClippingPreview />} />
      </Routes>
    </Router>
  );
}

export default App;