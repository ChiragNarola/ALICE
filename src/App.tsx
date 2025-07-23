import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import AppRouter from './routes/app-router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </Router>
  );
}

export default App;
