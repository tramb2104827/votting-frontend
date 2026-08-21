import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import VoterDashboard from './pages/VoterDashboard';
import ElectionList from './pages/ElectionList';
import ElectionDetail from './pages/ElectionDetail';

const AppRoutes = () => {
  return (
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/voter" element={<VoterDashboard />} />
        <Route path="/elections" element={<ElectionList />} />
        <Route path="/election/:id" element={<ElectionDetail />} />
      </Routes>
    </main>
  );
};

export default AppRoutes; 