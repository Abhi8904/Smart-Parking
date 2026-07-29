import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Clock, CreditCard, QrCode, Check, Minus, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParkingSlotRelation } from "@/pages/Search";

interface BookingModalProps {
  spot: ParkingSlotRelation | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ spot, isOpen, onClose }: BookingModalProps) {
  const [step, setStep] = useState<"details" | "payment" | "confirmation">("details");
  const [duration, setDuration] = useState(2);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!spot) return null;

  // Safe extractions from the relational DB model
  const locationName = spot.parking_locations?.name || "Premium Parking Spot";
  const locationAddress = spot.parking_locations?.address || "Address unavailable";
  const hourlyRate = spot.hourly_rate;
  
  // Pricing logic handling base rates
  const totalPrice = hourlyRate * duration;
  const serviceFee = 10.00; // Adjusted to currency standards (₹10 service fee)
  const grandTotal = totalPrice + serviceFee;

  const handleBooking = async () => {
    if (step === "details") {
      setStep("payment");
    } else if (step === "payment") {
      try {
        setIsSubmitting(true);

        // 1. Prepare dynamic timestamps based on selected duration
        const now = new Date();
        const start_time = now.toISOString();
        const end_time = new Date(now.getTime() + duration * 60 * 60 * 1000).toISOString();

        // 2. Package the data to match your SQL columns exactly
        const bookingData = {
          user_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", // Replace with actual logged-in user UUID later
          slot_id: spot.id, // Maps to the UUID primary key of your parking slot
          start_time: start_time,
          end_time: end_time,
          vehicle_type: "Four-Wheeler", // Dynamic text value
          vehicle_plate: vehicleNumber.trim(), // Stripped out text for safety
          total_amount: grandTotal, // Dynamic total calculated above
          status: "confirmed" // Custom enum token
        };

        // 3. POST the payload to your API endpoint
        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingData),
        });

        if (!response.ok) {
          throw new Error("Failed to save booking to database");
        }

        // Move to ticket receipt step if database accepted insertion
        setStep("confirmation");
      } catch (error) {
        console.error("Booking Error:", error);
        alert("Could not process booking. Please verify connections.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const resetAndClose = () => {
    setStep("details");
    setDuration(2);
    setVehicleNumber("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={isSubmitting ? undefined : resetAndClose}
          />
          
          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: "-40%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, y: "-40%" }}
            transition={{ type: "spring", duration: 0.4 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 w-full max-w-md bg-card rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header banner layout */}
            <div className="relative bg-gradient-primary p-6 text-primary-foreground">
              {!isSubmitting && (
                <button
                  onClick={resetAndClose}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <h2 className="font-display text-xl font-bold mb-1">
                {step === "confirmation" ? "Booking Confirmed!" : "Book Parking"}
              </h2>
              <div className="flex items-center gap-2 text-primary-foreground/80 text-sm">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="line-clamp-1">{locationName}</span>
              </div>
            </div>

            {/* Modal Step Contents */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {/* STEP 1: Details entry selection */}
                {step === "details" && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-6"
                  >
                    <div>
                      <Label className="text-sm font-medium mb-3 block">
                        Parking Duration (Slot: {spot.slot_number})
                      </Label>
                      <div className="flex items-center justify-center gap-6 bg-muted rounded-xl p-4">
                        <button
                          onClick={() => setDuration(Math.max(1, duration - 1))}
                          className="w-10 h-10 rounded-lg bg-card flex items-center justify-center hover:bg-primary/10 transition-colors"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        <div className="text-center">
                          <span className="font-display text-3xl font-bold text-foreground">
                            {duration}
                          </span>
                          <span className="text-muted-foreground ml-2">
                            hour{duration > 1 ? "s" : ""}
                          </span>
                        </div>
                        <button
                          onClick={() => setDuration(Math.min(24, duration + 1))}
                          className="w-10 h-10 rounded-lg bg-card flex items-center justify-center hover:bg-primary/10 transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="vehicle" className="text-sm font-medium mb-3 block">
                        Vehicle Number
                      </Label>
                      <Input
                        id="vehicle"
                        placeholder="e.g. TS 09 EA 1234"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                        className="h-12 uppercase tracking-wider"
                      />
                    </div>

                    {/* Dynamic Cost Breakdowns */}
                    <div className="bg-muted rounded-xl p-4 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          ₹{hourlyRate.toFixed(2)} × {duration} hours
                        </span>
                        <span className="font-medium text-foreground">
                          ₹{totalPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Convenience fee</span>
                        <span className="font-medium text-foreground">₹{serviceFee.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-border pt-2 mt-2 flex justify-between items-center">
                        <span className="font-semibold text-foreground">Total</span>
                        <span className="font-display text-xl font-bold text-primary">
                          ₹{grandTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Checkout / Payment Details */}
                {step === "payment" && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-6"
                  >
                    <div className="text-center py-4">
                      <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CreditCard className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="font-display font-semibold text-lg mb-1 text-foreground">
                        Secure Gateways
                      </h3>
                      <p className="text-muted-foreground text-xs px-6">
                        Confirming validation for slot space allocation credentials.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Cardholder Number</Label>
                        <Input placeholder="4321 5678 9012 3456" className="h-12" disabled={isSubmitting} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Expiry</Label>
                          <Input placeholder="MM/YY" className="h-12" disabled={isSubmitting} />
                        </div>
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Security Code</Label>
                          <Input placeholder="123" className="h-12" type="password" disabled={isSubmitting} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted rounded-xl p-4 flex justify-between items-center text-sm">
                      <span className="font-medium text-foreground">Amount Payable</span>
                      <span className="font-display text-xl font-bold text-primary">
                        ₹{grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Successful Ticket Output */}
                {step === "confirmation" && (
                  <motion.div
                    key="confirmation"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <Check className="w-8 h-8 text-success" />
                    </motion.div>

                    <h3 className="font-display text-2xl font-bold mb-1 text-foreground">
                      Space Secured!
                    </h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      Your parking token has been authenticated.
                    </p>

                    <div className="bg-card border border-border rounded-2xl p-4 inline-block mb-6 shadow-sm">
                      <div className="w-36 h-36 bg-muted rounded-xl flex items-center justify-center mx-auto">
                        <QrCode className="w-20 h-20 text-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 font-medium">
                        Scan pass at gateway gate terminals
                      </p>
                    </div>

                    <div className="space-y-2 text-sm bg-muted/40 p-3 rounded-2xl">
                      <div className="flex justify-between py-1.5 border-b border-border/60">
                        <span className="text-muted-foreground">Location Hub</span>
                        <span className="font-medium text-foreground line-clamp-1 max-w-[200px] text-right">{locationName}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-border/60">
                        <span className="text-muted-foreground">Identifer Designation</span>
                        <span className="font-semibold text-primary uppercase">Slot {spot.slot_number}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-border/60">
                        <span className="text-muted-foreground">Duration Blocks</span>
                        <span className="font-medium text-foreground">{duration} hours</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-muted-foreground">Vehicle Reg</span>
                        <span className="font-medium text-foreground tracking-wider">{vehicleNumber || "N/A"}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Central Dynamic Execution Button */}
              <Button
                variant={step === "confirmation" ? "success" : "hero"}
                size="lg"
                className="w-full mt-6 h-12 relative flex items-center justify-center gap-2"
                onClick={step === "confirmation" ? resetAndClose : handleBooking}
                disabled={(step === "details" && !vehicleNumber.trim()) || isSubmitting}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {step === "details" && "Continue to Payment"}
                {step === "payment" && (isSubmitting ? "Validating Card..." : "Authorize & Pay")}
                {step === "confirmation" && "Dismiss Pass"}
              </Button>

              {step !== "confirmation" && (
                <p className="text-center text-[11px] text-muted-foreground mt-4">
                  By clicking continuing paths, you acknowledge general garage transit guidelines.
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}