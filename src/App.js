import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import { SkeletonTheme } from 'react-loading-skeleton';
import { ReactNotifications } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'
import Login from './pages/login';
import AdminLogin from './pages/admin/login';
import AdminDashboard from './pages/admin/dashboard'
import Home from './pages/user/home';
import Profile from './pages/user/profile';
import Layout from './pages/user/layout';
import ViewManager from './pages/user/viewmanager';
import Member from './pages/user/member';
import ViewContent from './pages/user/viewcontent';
import Permission from './pages/user/permission';
import TaskDetail from './pages/user/task_detail';
function App() {
  return (
    <div style={{ 'height': '100vh' }} className="bg-dark text-light">
      <ReactNotifications/>
      <SkeletonTheme baseColor="#313131" highlightColor="#525252">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Login />} />
              <Route path="home" element={<Home />} />
              <Route path="profile/:id" element={<Profile />} />
              <Route path="workspace/:id" >
                <Route index element={<ViewManager />}/>
                <Route path='member' element={<Member />}/>
              </Route>
              <Route path="view/:id" >
                <Route index element={<ViewContent />}/>
                <Route path='member' element={<Permission />}/>
              </Route>
              <Route path="task/:id">
                <Route index element={<TaskDetail/>}/>
              </Route>
            </Route>
            <Route path='/admin'>
              <Route index element={<AdminLogin />} />
              <Route path="dashboard" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SkeletonTheme>
    </div>
  );
}

export default App;
