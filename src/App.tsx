import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './pages/login';
import Signup from './pages/signup';
import './App.css'
import ChildBasicInformation from './pages/ChildBasicInformation';
import Chat from './pages/ChatPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/child-basic-info" element={<ChildBasicInformation />} />
        <Route path="/chat" element={<Chat />} />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
