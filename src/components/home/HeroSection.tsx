import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Calendar, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

export function HeroSection() {
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?location=${encodeURIComponent(location)}`);
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary-foreground/90 text-sm font-medium mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              10,000+ parking spots available
            </motion.div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Find & Book
              <br />
              <span className="text-primary">Parking</span> in Seconds
            </h1>

            <p className="text-lg text-primary-foreground/70 mb-8 max-w-xl mx-auto lg:mx-0">
              Skip the hassle of finding parking. Book your spot in advance,
              pay online, and drive straight to your reserved space.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto lg:mx-0">
              <div className="bg-card/10 backdrop-blur-xl rounded-2xl p-2 shadow-xl border border-primary-foreground/10">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                    <Input
                      type="text"
                      placeholder="Where do you want to park?"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-12 h-14 bg-card border-0 rounded-xl text-base placeholder:text-muted-foreground"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="hero"
                    size="xl"
                    className="sm:w-auto w-full"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </form>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center lg:justify-start gap-8 mt-10"
            >
              {[
                { value: "50K+", label: "Happy Users" },
                { value: "10K+", label: "Parking Spots" },
                { value: "100+", label: "Cities" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-display text-2xl font-bold text-primary-foreground">
                    {stat.value}
                  </p>
                  <p className="text-sm text-primary-foreground/60">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden lg:block relative"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Floating Cards */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 right-0 bg-card rounded-2xl p-4 shadow-xl border border-border/50 z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-success/20 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Spot Reserved!</p>
                    <p className="text-xs text-muted-foreground">
                      Downtown Garage
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-20 left-0 bg-card rounded-2xl p-4 shadow-xl border border-border/50 z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-lg">$3.50/hr</p>
                    <p className="text-xs text-muted-foreground">
                      Best rate nearby
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Main Visual - Map Preview */}
              <div className="absolute inset-0 bg-gradient-card rounded-3xl shadow-2xl border border-border/30 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                <div className="h-full flex items-center justify-center">
                  <div className="relative">
                    <div className="w-48 h-48 rounded-full border-4 border-primary/30 flex items-center justify-center">
                      <div className="w-36 h-36 rounded-full border-4 border-primary/50 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-glow">
                          <MapPin className="w-10 h-10 text-primary" />
                        </div>
                      </div>
                    </div>
                    {/* Parking markers */}
                    {[
                      { top: "-10%", left: "80%", delay: 0 },
                      { top: "30%", left: "-15%", delay: 0.2 },
                      { top: "70%", left: "90%", delay: 0.4 },
                      { top: "90%", left: "20%", delay: 0.6 },
                    ].map((pos, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8 + pos.delay }}
                        className="absolute w-8 h-8 bg-accent rounded-full flex items-center justify-center shadow-lg"
                        style={{ top: pos.top, left: pos.left }}
                      >
                        <span className="text-xs font-bold text-accent-foreground">
                          P
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
