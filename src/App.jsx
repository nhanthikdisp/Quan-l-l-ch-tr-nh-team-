import React from 'react';
import { AuthProvider } from './store/AuthContext';
import { TripProvider } from './store/TripContext';
import AppRouter from './router/AppRouter';

export default function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <AppRouter />
      </TripProvider>
    </AuthProvider>
  );
}
