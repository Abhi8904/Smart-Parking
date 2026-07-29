import { useState } from "react";
import { motion } from "framer-motion";
import {
  Car,
  MapPin,
  Plus,
  DollarSign,
  Users,
  TrendingUp,
  QrCode,
  Settings,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    title: "Total Earnings",
    value: "$2,847",
    change: "+12.5%",
    icon: DollarSign,
    color: "text-success",
  },
  {
    title: "Active Bookings",
    value: "24",
    change: "+8",
    icon: Calendar,
    color: "text-primary",
  },
  {
    title: "Total Customers",
    value: "156",
    change: "+23",
    icon: Users,
    color: "text-accent",
  },
  {
    title: "Occupancy Rate",
    value: "78%",
    change: "+5%",
    icon: TrendingUp,
    color: "text-primary",
  },
];

const recentBookings = [
  {
    id: "1",
    vehicle: "ABC-1234",
    spot: "A-12",
    duration: "2 hours",
    amount: "$9.00",
    status: "active",
  },
  {
    id: "2",
    vehicle: "XYZ-5678",
    spot: "B-05",
    duration: "4 hours",
    amount: "$18.00",
    status: "active",
  },
  {
    id: "3",
    vehicle: "DEF-9012",
    spot: "A-08",
    duration: "1 hour",
    amount: "$4.50",
    status: "completed",
  },
  {
    id: "4",
    vehicle: "GHI-3456",
    spot: "C-15",
    duration: "3 hours",
    amount: "$13.50",
    status: "completed",
  },
];

const parkingLocations = [
  {
    id: "1",
    name: "Downtown Central Garage",
    address: "123 Main Street",
    totalSpots: 50,
    availableSpots: 12,
    pricePerHour: 4.5,
  },
  {
    id: "2",
    name: "Riverside Parking Lot",
    address: "789 River Road",
    totalSpots: 100,
    availableSpots: 45,
    pricePerHour: 2.5,
  },
];

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "locations" | "bookings" | "scanner">("overview");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-3xl md:text-4xl font-bold"
              >
                Owner Dashboard
              </motion.h1>
              <p className="text-muted-foreground mt-1">
                Manage your parking locations and bookings
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="hero">
                <Plus className="w-4 h-4 mr-2" />
                Add Location
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {[
              { id: "overview", label: "Overview", icon: TrendingUp },
              { id: "locations", label: "Locations", icon: MapPin },
              { id: "bookings", label: "Bookings", icon: Calendar },
              { id: "scanner", label: "QR Scanner", icon: QrCode },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <>
              {/* Stats Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {stat.title}
                            </p>
                            <p className="font-display text-3xl font-bold">
                              {stat.value}
                            </p>
                            <p className={`text-sm font-medium ${stat.color} mt-1`}>
                              {stat.change} this month
                            </p>
                          </div>
                          <div className={`p-3 rounded-xl bg-muted ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Recent Bookings */}
              <Card className="mb-8">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-display">Recent Bookings</CardTitle>
                  <Button variant="ghost" size="sm">
                    View All
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            Vehicle
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            Spot
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            Duration
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            Amount
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentBookings.map((booking) => (
                          <tr
                            key={booking.id}
                            className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                          >
                            <td className="py-4 px-4 font-medium">
                              {booking.vehicle}
                            </td>
                            <td className="py-4 px-4 text-muted-foreground">
                              {booking.spot}
                            </td>
                            <td className="py-4 px-4 text-muted-foreground">
                              {booking.duration}
                            </td>
                            <td className="py-4 px-4 font-medium">
                              {booking.amount}
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  booking.status === "active"
                                    ? "bg-success/20 text-success"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {booking.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "locations" && (
            <div className="grid md:grid-cols-2 gap-6">
              {parkingLocations.map((location) => (
                <Card key={location.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-display font-semibold text-lg">
                          {location.name}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" />
                          {location.address}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-muted rounded-xl">
                        <p className="font-display text-2xl font-bold">
                          {location.totalSpots}
                        </p>
                        <p className="text-xs text-muted-foreground">Total Spots</p>
                      </div>
                      <div className="text-center p-3 bg-success/10 rounded-xl">
                        <p className="font-display text-2xl font-bold text-success">
                          {location.availableSpots}
                        </p>
                        <p className="text-xs text-muted-foreground">Available</p>
                      </div>
                      <div className="text-center p-3 bg-primary/10 rounded-xl">
                        <p className="font-display text-2xl font-bold text-primary">
                          ${location.pricePerHour}
                        </p>
                        <p className="text-xs text-muted-foreground">Per Hour</p>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full mt-4">
                      Manage Location
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {/* Add New Location Card */}
              <Card className="border-dashed hover:border-primary/50 transition-colors cursor-pointer group">
                <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[250px]">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                    <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">
                    Add New Location
                  </h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Register a new parking location to start earning
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "scanner" && (
            <Card className="max-w-md mx-auto">
              <CardContent className="p-8 text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <QrCode className="w-12 h-12 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-2">
                  QR Code Scanner
                </h3>
                <p className="text-muted-foreground mb-6">
                  Scan customer QR codes to verify their parking reservations
                </p>
                <Button variant="hero" size="lg" className="w-full">
                  Start Scanning
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "bookings" && (
            <Card>
              <CardHeader>
                <CardTitle className="font-display">All Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">
                    Booking Management
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    View and manage all your parking bookings. Filter by date,
                    status, or location.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
