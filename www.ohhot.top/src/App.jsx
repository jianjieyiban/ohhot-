import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { JobProvider } from './contexts/JobContext';
import { CityProvider } from './contexts/CityContext';
import Layout from './components/Layout/Layout';
import SecretAdminAccess from './components/SecretAdminAccess';
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import AdminLogin from './pages/Auth/AdminLogin';
import Register from './pages/Auth/Register';
import JobList from './pages/Jobs/JobList';
import JobDetail from './pages/Jobs/JobDetail';
import JobCreate from './pages/Jobs/JobCreate';
import JobEdit from './pages/Jobs/JobEdit';
import Profile from './pages/Profile/Profile';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ApplicationDetails from './pages/Admin/ApplicationDetails';
import Applications from './pages/Admin/Applications';
import NotFound from './pages/Error/NotFound';
import MyResumes from './pages/User/MyResumes';
import MyFavorites from './pages/User/MyFavorites';
import MyApplications from './pages/User/MyApplications';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <JobProvider>
        <CityProvider>
          <Router>
            <div className="App">
              <Layout>
                <Routes>
                  {/* 公开路由 */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin-login" element={<AdminLogin />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/jobs" element={<JobList />} />
                  <Route path="/jobs/:id" element={<JobDetail />} />
                  
                  {/* 需要认证的路由 */}
                  <Route 
                    path="/jobs/create" 
                    element={
                      <ProtectedRoute>
                        <JobCreate />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* 需要认证的路由 */}
                  <Route 
                    path="/jobs/edit/:id" 
                    element={
                      <ProtectedRoute>
                        <JobEdit />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/my/resumes" 
                    element={
                      <ProtectedRoute>
                        <MyResumes />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/my/favorites" 
                    element={
                      <ProtectedRoute>
                        <MyFavorites />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/my/applications" 
                    element={
                      <ProtectedRoute>
                        <MyApplications />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* 管理员路由 */}
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute adminOnly={true}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/applications" 
                    element={
                      <ProtectedRoute adminOnly={true}>
                        <Applications />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/application-details/:id" 
                    element={
                      <ProtectedRoute adminOnly={true}>
                        <ApplicationDetails />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* 404页面 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
              {/* 隐藏的管理员访问组件 */}
              <SecretAdminAccess />
            </div>
          </Router>
        </CityProvider>
      </JobProvider>
    </AuthProvider>
  );
}

export default App;