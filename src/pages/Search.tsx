import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Search as SearchIcon, List, Map, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { ParkingCard } from "@/components/parking/ParkingCard";
import { SearchFilters, FilterState } from "@/components/parking/SearchFilters";
import { BookingModal } from "@/components/parking/BookingModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// 1. Structural Interface Matching Supabase Joined Query
export interface ParkingSlotRelation {
  id: string;
  slot_number: string;
  slot_type: string;
  hourly_rate: number;
  daily_rate: number | null;
  is_available: boolean;
  is_active: boolean;
  parking_locations: {
    id: string;
    name: string;
    address: string;
    city: string;
  } | null;
}

// 2. Transformed Interface for Location Aggregation
export interface AggregatedLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  displayPrice: number;
  totalSpots: number;
  availableSpots: number;
  availableSlotsList: ParkingSlotRelation[];
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const initialLocation = searchParams.get("location") || "";
  
  const [searchQuery, setSearchQuery] = useState(initialLocation);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  
  // State for fetched slots from DB
  const [parkingSlots, setParkingSlots] = useState<ParkingSlotRelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSpot, setSelectedSpot] = useState<ParkingSlotRelation | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 200], // Adjusted upper bounds for local currencies
    distance: 5,
    minRating: 0,
    features: [],
  });

  // Fetch Data from Supabase with relational join
  const fetchParkingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from("parking_slots")
        .select(`
          id,
          slot_number,
          slot_type,
          hourly_rate,
          daily_rate,
          is_available,
          is_active,
          parking_locations (
            id,
            name,
            address,
            city
          )
        `)
        .eq("is_active", true);

      if (supabaseError) throw supabaseError;
      
      setParkingSlots((data as unknown as ParkingSlotRelation[]) || []);
    } catch (err: any) {
      console.error("Error fetching parking slots:", err);
      setError(err.message || "An unexpected error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  // Initial Data Fetch
  useEffect(() => {
    fetchParkingData();
  }, []);

  // Supabase Realtime Listener Setup
  // useEffect(() => {
  //   const channel = supabase
  //     .channel("realtime-search-updates")
  //     .on(
  //       "postgres_changes",
  //       {
  //         event: "UPDATE", // Listens for database updates
  //         schema: "public",
  //         table: "parking_slots",
  //       },
  //       async (payload) => {
  //         console.log("Realtime slot modification intercepted:", payload.new);

  //         const updatedSlot = payload.new as any;

  //         // Hydrate the relational data if it's missing from the pure table payload
  //         if (!updatedSlot.parking_locations) {
  //           const { data } = await supabase
  //             .from("parking_slots")
  //             .select("parking_locations(id, name, address, city)")
  //             .eq("id", updatedSlot.id)
  //             .single();
            
  //           if (data) {
  //             updatedSlot.parking_locations = data.parking_locations;
  //           }
  //         }

  //         // Merge updates into state array
  //         setParkingSlots((currentSlots) =>
  //           currentSlots.map((slot) =>
  //             slot.id === updatedSlot.id 
  //               ? { ...slot, ...updatedSlot } 
  //               : slot
  //           )
  //         );
  //       }
  //     )
  //     .subscribe();

  //   return () => {
  //     supabase.removeChannel(channel);
  //   };
  // }, []);

  // Supabase Realtime Listener Setup
  useEffect(() => {
    const channel = supabase
      .channel("realtime-search-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "parking_slots",
        },
        (payload) => {
          console.log("Realtime raw payload:", payload.new);

          setParkingSlots((currentSlots) => {
            // 1. Create a shallow copy of the array to guarantee React intercepts the state modification
            const updatedArray = currentSlots.map((slot) => {
              // 2. Use loose equality (==) in case one ID is a string and the other is an integer
              if (slot.id == payload.new.id) {
                console.log(`Matched slot match found for ID: ${slot.id}. Updating availability status.`);
                
                return {
                  ...slot,
                  // Explicitly ensure the incoming boolean updates correctly
                  is_available: payload.new.is_available === true || payload.new.is_available === "true"
                };
              }
              return slot;
            });

            return updatedArray;
          });
        }
      )
      .subscribe((status) => {
        console.log("Supabase Realtime subscription status changed to:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSpotSelect = (spot: ParkingSlotRelation) => {
    setSelectedSpot(spot);
    setIsBookingOpen(true);
  };

  // 3. Frontend Data Reduction: Group individual slots into location-level stats
  const aggregatedLocations = parkingSlots.reduce<AggregatedLocation[]>((acc, slot) => {
    const locationInfo = slot.parking_locations;
    if (!locationInfo) return acc;

    const existingLoc = acc.find((loc) => loc.id === locationInfo.id);

    if (existingLoc) {
      // Always count the spot toward the total pool
      existingLoc.totalSpots += 1;
      
      if (slot.is_available) {
        existingLoc.availableSpots += 1;
        existingLoc.availableSlotsList.push(slot);
      }
      
      // Track the lowest baseline price for the UI card display
      if (slot.hourly_rate < existingLoc.displayPrice) {
        existingLoc.displayPrice = slot.hourly_rate;
      }
    } else {
      acc.push({
        id: locationInfo.id,
        name: locationInfo.name,
        address: locationInfo.address,
        city: locationInfo.city,
        displayPrice: slot.hourly_rate,
        totalSpots: 1, // Start baseline total counting
        availableSpots: slot.is_available ? 1 : 0,
        availableSlotsList: slot.is_available ? [slot] : [],
      });
    }

    return acc;
  }, []);

  // 4. Apply filter configurations to the aggregated locations
  const filteredLocations = aggregatedLocations.filter((location) => {
    // Check pricing range limits
    if (location.displayPrice < filters.priceRange[0] || location.displayPrice > filters.priceRange[1]) {
      return false;
    }
    
    // Check text search matches
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const nameMatch = location.name.toLowerCase().includes(query);
      const addressMatch = location.address.toLowerCase().includes(query);
      const cityMatch = location.city.toLowerCase().includes(query);
      if (!nameMatch && !addressMatch && !cityMatch) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Search Header */}
          <div className="mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-3xl md:text-4xl font-bold mb-6"
            >
              Find Parking Near You
            </motion.h1>

            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter location, address, or landmark"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-card border-border"
                />
              </div>

              {/* View Control Actions */}
              <div className="flex gap-3">
                <SearchFilters onFilterChange={setFilters} />
                
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-4 py-2 flex items-center gap-2 transition-colors ${
                      viewMode === "list"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card hover:bg-muted"
                    }`}
                  >
                    <List className="w-4 h-4" />
                    <span className="hidden sm:inline">List</span>
                  </button>
                  <button
                    onClick={() => setViewMode("map")}
                    className={`px-4 py-2 flex items-center gap-2 transition-colors ${
                      viewMode === "map"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card hover:bg-muted"
                    }`}
                  >
                    <Map className="w-4 h-4" />
                    <span className="hidden sm:inline">Map</span>
                  </button>
                </div>

                <Button variant="hero" className="px-6" onClick={fetchParkingData}>
                  <SearchIcon className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* Feedback Layout Handling States */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Aggregating live parking locations...</p>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center text-destructive max-w-md mx-auto my-10">
              <p className="font-semibold mb-2">Error loading data</p>
              <p className="text-sm mb-4">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchParkingData}>Try Again</Button>
            </div>
          ) : (
            <>
              {/* Results Count Header */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {filteredLocations.length}
                  </span>{" "}
                  parking locations found
                  {searchQuery && (
                    <span>
                      {" "}near <span className="font-medium">"{searchQuery}"</span>
                    </span>
                  )}
                </p>
              </div>

              {/* Grid Layout Render Block */}
              {viewMode === "list" ? (
                filteredLocations.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLocations.map((location) => (
                      <ParkingCard
                        key={location.id}
                        name={location.name}
                        address={location.address}
                        city={location.city}
                        displayPrice={location.displayPrice}
                        totalSpots={location.totalSpots}
                        availableSpots={location.availableSpots}
                        onBookNext={() => {
                          if (location.availableSlotsList.length > 0) {
                            handleSpotSelect(location.availableSlotsList[0]);
                          }
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card">
                    <p className="text-muted-foreground">No parking options available matching these criteria.</p>
                  </div>
                )
              ) : (
                <div className="bg-card rounded-2xl border border-border overflow-hidden h-[600px]">
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <div className="text-center">
                      <Map className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Map view coming soon
                      </p>
                      <p className="text-sm text-muted-foreground/70">
                        Google Maps integration required
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Booking Modal Window context */}
      <BookingModal
        spot={selectedSpot}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
}