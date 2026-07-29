import { motion } from "framer-motion";
import { ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-hero relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* For Drivers */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card/10 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-primary-foreground/10"
          >
            <h3 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
              Ready to Park Smarter?
            </h3>
            <p className="text-primary-foreground/70 mb-6">
              Join thousands of drivers who save time and money by booking
              parking spots in advance. No more circling blocks or stress.
            </p>
            <Link to="/search">
              <Button variant="hero" size="lg">
                Find Parking Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>

          {/* For Owners */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-3xl p-8 md:p-10 shadow-2xl"
          >
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">
              Own a Parking Space?
            </h3>
            <p className="text-muted-foreground mb-6">
              Turn your empty parking spots into passive income. List your
              space, set your rates, and start earning today.
            </p>
            <Link to="/owner">
              <Button variant="accent" size="lg">
                List Your Space
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
