import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import AppRouter from './routes/app-router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import { ChildrenProvider } from '../src/contexts/ChildrenContext';
import { ChatProvider } from './contexts/ChatContext';
import { ChatActivityProvider } from '../src/contexts/ChatActivityContext';

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <ChatActivityProvider>
        <AuthProvider>
          <ChildrenProvider>
            <ChatProvider>
              <AppRouter />
            </ChatProvider>
          </ChildrenProvider>
        </AuthProvider>
      </ChatActivityProvider>
    </Router>
  );
}

export default App;
