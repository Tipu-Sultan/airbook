import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthProvider from './context/AuthContext';
import Loading from './components/Loading';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Book = lazy(() => import('./pages/Book'));
const Flights = lazy(() => import('./pages/Flights'));
const FlightDetails = lazy(() => import('./pages/FlightDetails'));
const BookingOrderDetails = lazy(() => import('./pages/BookingOrderDetails'));

const Profile = lazy(() => import('./pages/Profile'));

function App() {
  return (
    <AuthProvider>
      <Router> {/* Move Router here to wrap Navbar and Routes */}
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto p-6">
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/book/:FlightId" element={<Book />} />
                <Route path="/flights" element={<Flights />} />
                <Route path="/flights/:FlightId" element={<FlightDetails />} />
                <Route path="/booking-order/:bookingId" element={<BookingOrderDetails />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;