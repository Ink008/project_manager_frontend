import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import { SkeletonTheme } from 'react-loading-skeleton';
import { ReactNotifications } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'
import Login from './pages/login';
import AdminLogin from './pages/admin/login';
import AdminDashboard from './pages/admin/dashboard'

function App() {
  return (
    <div style={{ 'height': '100vh' }} className="bg-dark text-light">
      <ReactNotifications/>
      <SkeletonTheme baseColor="#313131" highlightColor="#525252">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/admin" element={<AdminLogin />}/>
            <Route path="/admin/dashboard" element={<AdminDashboard />}/>
          </Routes>
        </BrowserRouter>
      </SkeletonTheme>
    </div>
  );
}

export default App;
