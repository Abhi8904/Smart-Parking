import { motion } from "framer-motion";
import { 
  MapPin, 
  CreditCard, 
  QrCode, 
  Clock, 
  Shield, 
  Smartphone 
} from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Real-time Availability",
    description:
      "See available parking spots in real-time on an interactive map with live updates.",
  },
  {
    icon: Clock,
    title: "Instant Booking",
    description:
      "Book your parking spot in seconds. Select duration, confirm, and you're done.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description:
      "Pay securely online with multiple payment options. No cash needed.",
  },
  {
    icon: QrCode,
    title: "QR Code Entry",
    description:
      "Get a unique QR code for hassle-free entry and exit at parking locations.",
  },
  {
    icon: Shield,
    title: "Guaranteed Spots",
    description:
      "Your reserved spot is guaranteed. No more circling blocks looking for parking.",
  },
  {
    icon: Smartphone,
    title: "Smart Notifications",
    description:
      "Receive reminders before your parking expires. Extend your time from your phone.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function FeaturesSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Why Choose Us
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 mb-4">
            Parking Made <span className="text-gradient">Simple</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We've reimagined the parking experience from the ground up. No more
            stress, no more wasted time.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative bg-card rounded-2xl p-8 shadow-md border border-border/50 hover:shadow-xl hover:border-primary/30 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
