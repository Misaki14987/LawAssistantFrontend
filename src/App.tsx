import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './compoents/Login/Login'; 
import Chat from './compoents/Aichat/index';
import Register from './compoents/Login/Register';
import Index from './compoents/filemanage/Index';
import Home from './compoents/Index/Home';
import LawDocGeneratePage from './compoents/AiConsult';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <BrowserRouter>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register/>} />
          {/* 受保护的路由 - 需要登录才能访问 */}
          <Route path="/chat" element={
            <ProtectedRoute>
              <Chat/>
            </ProtectedRoute>
          } />
          <Route path="/index" element={
            <ProtectedRoute>
              <Index/>
            </ProtectedRoute>
          } />
          <Route path='/consult' element={
            <ProtectedRoute>
              <LawDocGeneratePage/>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;