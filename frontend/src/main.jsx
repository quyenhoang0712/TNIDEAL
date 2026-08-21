import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import LearningPage from './pages/LearningPage.jsx';
import './styles.css';

const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
const RootPage = pathname === '/hocthuat' ? LearningPage : App;

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootPage />
  </React.StrictMode>
);
