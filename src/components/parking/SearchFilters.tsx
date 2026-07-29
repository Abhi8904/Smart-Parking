import { useState } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, X, Clock, DollarSign, Star, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface SearchFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  priceRange: [number, number];
  distance: number;
  minRating: number;
  features: string[];
}

const featureOptions = [
  { id: "covered", label: "Covered Parking" },
  { id: "ev-charging", label: "EV Charging" },
  { id: "24-7", label: "24/7 Access" },
  { id: "security", label: "Security Camera" },
  { id: "accessible", label: "Wheelchair Accessible" },
  { id: "valet", label: "Valet Service" },
];

export function SearchFilters({ onFilterChange }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 20],
    distance: 5,
    minRating: 0,
    features: [],
  });

  const handleFeatureToggle = (feature: string) => {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter((f) => f !== feature)
      : [...filters.features, feature];
    
    const newFilters = { ...filters, features: newFeatures };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = (value: number[]) => {
    const newFilters = { ...filters, priceRange: [value[0], value[1]] as [number, number] };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDistanceChange = (value: number[]) => {
    const newFilters = { ...filters, distance: value[0] };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRatingChange = (value: number[]) => {
    const newFilters = { ...filters, minRating: value[0] };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      priceRange: [0, 20],
      distance: 5,
      minRating: 0,
      features: [],
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters
        {filters.features.length > 0 && (
          <span className="ml-1 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
            {filters.features.length}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-foreground/20 z-40"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 mt-2 w-80 bg-card rounded-2xl shadow-xl border border-border p-6 z-50"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold text-lg">Filters</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">Price per hour</span>
              </div>
              <Slider
                defaultValue={filters.priceRange}
                min={0}
                max={30}
                step={1}
                onValueChange={handlePriceChange}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>${filters.priceRange[0]}</span>
                <span>${filters.priceRange[1]}+</span>
              </div>
            </div>

            {/* Distance */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Car className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">Max distance</span>
              </div>
              <Slider
                defaultValue={[filters.distance]}
                min={0.5}
                max={10}
                step={0.5}
                onValueChange={handleDistanceChange}
                className="mb-2"
              />
              <div className="text-sm text-muted-foreground">
                Within {filters.distance} miles
              </div>
            </div>

            {/* Rating */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">Minimum rating</span>
              </div>
              <Slider
                defaultValue={[filters.minRating]}
                min={0}
                max={5}
                step={0.5}
                onValueChange={handleRatingChange}
                className="mb-2"
              />
              <div className="text-sm text-muted-foreground">
                {filters.minRating > 0 ? `${filters.minRating}+ stars` : "Any rating"}
              </div>
            </div>

            {/* Features */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">Features</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {featureOptions.map((feature) => (
                  <div key={feature.id} className="flex items-center gap-2">
                    <Checkbox
                      id={feature.id}
                      checked={filters.features.includes(feature.id)}
                      onCheckedChange={() => handleFeatureToggle(feature.id)}
                    />
                    <Label
                      htmlFor={feature.id}
                      className="text-sm cursor-pointer"
                    >
                      {feature.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={clearFilters}
              >
                Clear All
              </Button>
              <Button
                variant="hero"
                className="flex-1"
                onClick={() => setIsOpen(false)}
              >
                Apply
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
