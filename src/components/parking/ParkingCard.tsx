import { MapPin, Star, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ParkingSlotRelation } from "@/pages/Search";

interface ParkingCardProps {
  name: string;
  address: string;
  city: string;
  displayPrice: number;
  totalSpots: number;
  availableSpots: number;
  onBookNext: () => void;
}

export function ParkingCard({
  name,
  address,
  city,
  displayPrice,
  totalSpots,
  availableSpots,
  onBookNext,
}: ParkingCardProps) {
  const isAvailable = availableSpots > 0;

  return (
    <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Visual Header Image Container */}
      <div className="relative h-44 bg-muted flex flex-col items-center justify-center p-4">
        <Car className="w-12 h-12 text-primary/40 mb-2" />
        <div className="rounded-2xl bg-background/80 backdrop-blur-sm px-4 py-2 text-center shadow-sm">
          <span className="font-display font-bold text-xl text-foreground">₹{displayPrice}</span>
          <span className="text-xs text-muted-foreground">/hr</span>
        </div>
        <Badge 
          variant={isAvailable ? "outline" : "destructive"}
          className="absolute top-4 left-4"
        >
          {isAvailable ? "Available" : "Full"}
        </Badge>
      </div>

      {/* Content Details */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-display font-bold text-lg text-foreground line-clamp-1">
            {name}
          </h3>
          <div className="flex items-center gap-1 text-sm font-semibold text-foreground shrink-0 mt-1">
            <Star className="w-4 h-4 fill-warning text-warning" />
            <span>4.5</span>
          </div>
        </div>

        <div className="flex items-start gap-2 text-muted-foreground text-xs mb-4">
          <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span className="line-clamp-2">{address}, {city}</span>
        </div>

        {/* Aggregate Availability Counter */}
        <div className="bg-muted/50 rounded-xl p-3.5 mb-6">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-muted-foreground font-medium">Availability Status</span>
            <span className={`font-semibold ${isAvailable ? "text-success" : "text-destructive"}`}>
              {isAvailable ? "Ready to book" : "No slots vacant"}
            </span>
          </div>
          <div className="w-full bg-border h-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-500" 
              style={{ width: `${(availableSpots / totalSpots) * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-medium">
            <span className="text-foreground font-bold">{availableSpots}</span> out of <span className="text-foreground font-bold">{totalSpots}</span> spots free
          </p>
        </div>

        {/* Global Action Selector Button */}
        <Button
          variant="hero"
          className="w-full mt-auto"
          onClick={onBookNext}
          disabled={!isAvailable}
        >
          {isAvailable ? "Book Now" : "Fully Booked"}
        </Button>
      </div>
    </div>
  );
}