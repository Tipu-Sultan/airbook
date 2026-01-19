// AddFlight.jsx - Full separate page (no Dialog)
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "../hooks/use-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { getAllRoutes, addFlight } from "../services/api";

function AddFlight() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [departureDate, setDepartureDate] = useState(null);
  const [arrivalDate, setArrivalDate] = useState(null);

  const [form, setForm] = useState({
    flightNumber: "",
    routeId: "",
  });

  const [seatConfig, setSeatConfig] = useState({
    first: { enabled: false, startRow: "", endRow: "", letters: "" },
    business: { enabled: true, startRow: "1", endRow: "10", letters: "A,B,C,D" },
    economy: { enabled: true, startRow: "11", endRow: "40", letters: "A,B,C,D,E,F" },
  });

  useEffect(() => {
    if (!token || !user || user.user_type !== "Admin") {
      navigate("/admin-dashboard");
      return;
    }
    async function fetchRoutes() {
      try {
        const data = await getAllRoutes();
        setRoutes(data || []);
      } catch (err) {
        toast({ title: "Error", description: "Failed to load routes", variant: "destructive" });
      }
    }
    fetchRoutes();
  }, [token, user, navigate]);

  const handleNumberInput = (value, setter, field, classKey) => {
    if (/^\d*$/.test(value)) {
      if (classKey) {
        setSeatConfig(prev => ({
          ...prev,
          [classKey]: { ...prev[classKey], [field]: value },
        }));
      } else {
        setter(value);
      }
    }
  };

  const calculateTotalSeats = () => {
    let total = 0;
    Object.entries(seatConfig).forEach(([_, cfg]) => {
      if (cfg.enabled && cfg.startRow && cfg.endRow && cfg.letters.trim()) {
        const rows = Number(cfg.endRow) - Number(cfg.startRow) + 1;
        const lettersCount = cfg.letters.split(",").filter(l => l.trim()).length;
        if (rows > 0 && lettersCount > 0) {
          total += rows * lettersCount;
        }
      }
    });
    return total;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!departureDate || !arrivalDate) {
      toast({ title: "Error", description: "Please select departure and arrival times", variant: "destructive" });
      return;
    }
    if (arrivalDate <= departureDate) {
      toast({ title: "Error", description: "Arrival must be after departure", variant: "destructive" });
      return;
    }

    const totalSeats = calculateTotalSeats();
    if (totalSeats === 0) {
      toast({ title: "Error", description: "Configure at least one valid seat class", variant: "destructive" });
      return;
    }

    const seatConfigs = {};
    Object.entries(seatConfig).forEach(([key, cfg]) => {
      if (cfg.enabled && cfg.startRow && cfg.endRow && cfg.letters.trim()) {
        seatConfigs[key] = {
          startRow: Number(cfg.startRow),
          endRow: Number(cfg.endRow),
          letters: cfg.letters.split(",").map(l => l.trim()).filter(l => l),
        };
      }
    });

    setLoading(true);
    try {
      await addFlight({
        flight_number: form.flightNumber,
        route_id: Number(form.routeId),
        departure_time: format(departureDate, "yyyy-MM-dd HH:mm:ss"),
        arrival_time: format(arrivalDate, "yyyy-MM-dd HH:mm:ss"),
        total_seats: totalSeats,
        seatConfigs, // Send custom config (assume backend uses it or fallback to fixed)
      });
      toast({ title: "Success", description: "Flight added successfully!" });
      navigate("/admin-dashboard");
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to add flight", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <Card className="max-w-4xl mx-auto shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-700 to-blue-900 text-white">
          <CardTitle className="text-2xl md:text-3xl font-bold">Add New Flight</CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Flight Number</Label>
                <Input
                  required
                  placeholder="e.g. AI202"
                  value={form.flightNumber}
                  onChange={(e) => setForm({ ...form, flightNumber: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <Label>Route</Label>
                <select
                  required
                  className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-blue-500"
                  value={form.routeId}
                  onChange={(e) => setForm({ ...form, routeId: e.target.value })}
                >
                  <option value="">Select a route</option>
                  {routes.map((route) => (
                    <option key={route.route_id} value={route.route_id}>
                      {route.departure_city} → {route.arrival_city} (₹{route.base_price})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Departure Date & Time</Label>
                <DatePicker
                  selected={departureDate}
                  onChange={setDepartureDate}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="dd/MM/yyyy HH:mm"
                  minDate={new Date()}
                  placeholderText="Select departure"
                  className="w-full h-10 px-3 border border-input rounded-md focus:ring-2 focus:ring-blue-500"
                  wrapperClassName="w-full"
                  required
                />
              </div>
              <div>
                <Label>Arrival Date & Time</Label>
                <DatePicker
                  selected={arrivalDate}
                  onChange={setArrivalDate}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="dd/MM/yyyy HH:mm"
                  minDate={departureDate || new Date()}
                  placeholderText="Select arrival"
                  className="w-full h-10 px-3 border border-input rounded-md focus:ring-2 focus:ring-blue-500"
                  wrapperClassName="w-full"
                  required
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold text-blue-900">Seat Configuration</h3>
              <p className="text-sm text-gray-600">Configure rows and seat letters for each class. Total seats will be calculated automatically.</p>

              {[
                { key: "first", label: "First Class", color: "amber" },
                { key: "business", label: "Business Class", color: "green" },
                { key: "economy", label: "Economy Class", color: "blue" },
              ].map(({ key, label, color }) => {
                const cfg = seatConfig[key];
                return (
                  <Card key={key} className={`border-l-4 border-${color}-500`}>
                    <CardContent className="pt-6">
                      <Label className="flex items-center gap-3 text-lg font-semibold">
                        <input
                          type="checkbox"
                          checked={cfg.enabled}
                          onChange={(e) =>
                            setSeatConfig(prev => ({
                              ...prev,
                              [key]: { ...cfg, enabled: e.target.checked },
                            }))
                          }
                        />
                        {label}
                      </Label>
                      {cfg.enabled && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                          <div>
                            <Label>Start Row</Label>
                            <Input
                              placeholder="1"
                              value={cfg.startRow}
                              onChange={(e) => handleNumberInput(e.target.value, null, "startRow", key)}
                              required
                            />
                          </div>
                          <div>
                            <Label>End Row</Label>
                            <Input
                              placeholder="10"
                              value={cfg.endRow}
                              onChange={(e) => handleNumberInput(e.target.value, null, "endRow", key)}
                              required
                            />
                          </div>
                          <div>
                            <Label>Seat Letters (comma separated)</Label>
                            <Input
                              placeholder="A,B,C,D,E,F"
                              value={cfg.letters}
                              onChange={(e) =>
                                setSeatConfig(prev => ({
                                  ...prev,
                                  [key]: { ...cfg, letters: e.target.value },
                                }))
                              }
                              required
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              <div className="text-right text-xl font-bold text-blue-900">
                Estimated Total Seats: {calculateTotalSeats()}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Adding Flight...
                  </>
                ) : (
                  "Add Flight"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin-dashboard")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default AddFlight;