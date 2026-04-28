import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AdminApp from './AdminApp';

const root = ReactDOM.createRoot(document.getElementById('root'));

const isAdmin = window.location.pathname.startsWith('/admin');

root.render(isAdmin ? <AdminApp /> : <App />);
