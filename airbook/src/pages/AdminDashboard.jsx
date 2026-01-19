import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "../hooks/use-toast";
import {
  getAllFlights,
  getAllUsers,
  getAllRoutes,
  getAllBookings,
} from "../services/api";

function AdminDashboard() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [flightStats, setFlightStats] = useState({ total_flights: 0, total_routes: 0 });
  const [users, setUsers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!token || !user || user.user_type !== "Admin") {
      navigate("/");
      return;
    }
  }, [token, user, navigate]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [stats, u, r, b] = await Promise.all([
          getAllFlights(),
          getAllUsers(),
          getAllRoutes(),
          getAllBookings(),
        ]);
        setFlightStats(stats || { total_flights: 0, total_routes: 0 });
        setUsers(u || []);
        setRoutes(r || []);
        setBookings(b || []);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    if (token && user?.user_type === "Admin") {
      fetchData();
    }
  }, [token, user]);

  const totalRevenue = bookings
    .filter((b) => b.booking?.status === "confirmed")
    .reduce((sum, b) => sum + Number(b.booking?.total_price || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-blue-800">
        Admin Dashboard
      </h1>

      <div className="flex justify-end mb-8">
        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
          <Link to="/admin-dashboard/add-flight">Add New Flight</Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card>
          <CardHeader className="bg-blue-600 text-white">
            <CardTitle>Total Flights</CardTitle>
          </CardHeader>
          <CardContent className="text-4xl font-bold text-center py-8">
            {flightStats.total_flights}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="bg-green-600 text-white">
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent className="text-4xl font-bold text-center py-8">
            {users.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="bg-purple-600 text-white">
            <CardTitle>Total Routes</CardTitle>
          </CardHeader>
          <CardContent className="text-4xl font-bold text-center py-8">
            {routes.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="bg-orange-600 text-white">
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent className="text-4xl font-bold text-center py-8">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.user_id}>
                    <TableCell>{`${u.first_name} ${u.last_name}`}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{new Date(u.created_at).toLocaleDateString("en-IN")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Routes Table */}
        <Card>
          <CardHeader>
            <CardTitle>Routes</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Distance (km)</TableHead>
                  <TableHead>Base Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((r) => (
                  <TableRow key={r.route_id}>
                    <TableCell>{r.departure_city}</TableCell>
                    <TableCell>{r.arrival_city}</TableCell>
                    <TableCell>{r.distance_km}</TableCell>
                    <TableCell>₹{Number(r.base_price).toLocaleString("en-IN")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table (full width) */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Flight</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((b) => {
                const seatNumbers = b.seats?.map(s => s.seat_number).join(", ") || "-";
                return (
                  <TableRow key={b.booking.booking_id}>
                    <TableCell className="font-medium">{b.booking.booking_id}</TableCell>
                    <TableCell>{b.user?.email || "-"}</TableCell>
                    <TableCell>{b.flight?.flight_number || "-"}</TableCell>
                    <TableCell>{seatNumbers} ({b.seats?.length || 0} seats)</TableCell>
                    <TableCell>₹{Number(b.booking.total_price || 0).toLocaleString("en-IN")}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        b.booking.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {b.booking.status}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(b.booking.booking_date).toLocaleDateString("en-IN")}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminDashboard;