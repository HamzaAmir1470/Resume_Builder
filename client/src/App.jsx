import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Layout from './pages/layout'
import Dashboard from './pages/Dashboard'
import ResumeBuilder from './pages/ResumeBuilder'
import Preview from './pages/Preview'
import api from './configs/api';
import { useDispatch } from 'react-redux'
import { login, setLoading } from './app/features/authSlice'
import { Toaster } from 'react-hot-toast'

const App = () => {

  const dispatch = useDispatch();

  const getUserData = async () => {
    const token = localStorage.getItem('token')?.trim();

    try {
      if (!token) {
        dispatch(setLoading(false));
        return;
      }

      console.log("Token sent from App.jsx:", token);

      //  FIX: Send token with Bearer prefix
      const { data } = await api.get('/api/users/data', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.user) {
        // Store user + token in redux
        dispatch(login({ token, user: data.user }));
      }

      dispatch(setLoading(false));

    } catch (error) {
      console.log("User fetch failed:", error?.response?.data || error.message);

      // Token invalid → remove token from localStorage
      localStorage.removeItem('token');

      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <>
      <Toaster />

      <Routes>

        <Route path='/' element={<Home />} />

        <Route path='app' element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path='builder/:resumeId' element={<ResumeBuilder />} />
        </Route>

        <Route path='view/:resumeId' element={<Preview />} />

      </Routes>
    </>
  );
};

export default App;
