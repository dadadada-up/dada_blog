import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import ScheduledTasksPage from './pages/ScheduledTasksPage';
import DebugCenterPage from './pages/DebugCenterPage';
import SettingsPage from './pages/SettingsPage';

// 导航组件
const Navigation = () => {
  const location = useLocation();
  
  return (
    <nav className="navigation">
      <div className="nav-container">
        <h1 className="nav-title">钉钉消息推送机器人</h1>
        <div className="nav-tabs">
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'nav-tab active' : 'nav-tab'}
          >
            定时任务
          </Link>
          <Link 
            to="/debug" 
            className={location.pathname === '/debug' ? 'nav-tab active' : 'nav-tab'}
          >
            调试中心
          </Link>
          <Link 
            to="/settings" 
            className={location.pathname === '/settings' ? 'nav-tab active' : 'nav-tab'}
          >
            设置
          </Link>
        </div>
      </div>
    </nav>
  );
};

// 主应用组件
function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ScheduledTasksPage />} />
            <Route path="/debug" element={<DebugCenterPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
        <ToastContainer position="top-center" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;