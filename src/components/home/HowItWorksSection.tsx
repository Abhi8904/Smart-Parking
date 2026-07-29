import { motion } from "framer-motion";
import { Search, CalendarCheck, QrCode, Car } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Search Location",
    description:
      "Enter your destination and find available parking spots nearby with real-time availability.",
  },
  {
    icon: CalendarCheck,
    step: "02",
    title: "Book & Pay",
    description:
      "Select your preferred spot, choose duration, and complete secure online payment.",
  },
  {
    icon: QrCode,
    step: "03",
    title: "Get QR Code",
    description:
      "Receive a unique QR code instantly for hassle-free entry at your parking location.",
  },
  {
    icon: Car,
    step: "04",
    title: "Park & Go",
    description:
      "Scan your QR code at entry, park in your reserved spot, and enjoy your day.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Simple Process
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 mb-4">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Book your parking spot in just four simple steps
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center"
              >
                <div className="relative z-10 mx-auto w-20 h-20 bg-card rounded-2xl shadow-lg border border-border flex items-center justify-center mb-6 group hover:shadow-xl hover:border-primary/50 transition-all duration-300">
                  <item.icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center text-sm font-bold text-accent-foreground shadow-md">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
