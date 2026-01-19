// Updated App.jsx with protected routes
import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import AuthProvider from "./context/AuthContext";
import Loading from "./components/Loading";
import { Toaster } from "@/components/ui/sonner";
import { AdminRoute, PrivateRoute } from "./components/PrivateRoute";

// Lazy-loaded pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Book = lazy(() => import("./pages/Book"));
const Flights = lazy(() => import("./pages/Flights"));
const FlightDetails = lazy(() => import("./pages/FlightDetails"));
const BookingOrderDetails = lazy(() => import("./pages/BookingOrderDetails"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AddFlight = lazy(() => import("./dashboard/AddFlight"));

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster />
          <Navbar />
          <main className="container mx-auto p-6">
            <Suspense fallback={<Loading />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/flights" element={<Flights />} />
                <Route path="/flights/:FlightId" element={<FlightDetails />} />

                {/* Private Routes (Logged-in Users Only) */}
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/book/:FlightId"
                  element={
                    <PrivateRoute>
                      <Book />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/booking-order/:bookingId"
                  element={
                    <PrivateRoute>
                      <BookingOrderDetails />
                    </PrivateRoute>
                  }
                />

                {/* Admin Routes (Admin Only) */}
                <Route
                  path="/admin-dashboard"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin-dashboard/add-flight"
                  element={
                    <AdminRoute>
                      <AddFlight />
                    </AdminRoute>
                  }
                />
              </Routes>
            </Suspense>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
