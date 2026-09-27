import { MessageCircle } from "lucide-react";

export function FloatingSupport() {
  return (
    <a
      href="https://wa.me/918808227885?text=Hi%20SS%20TECH%20SERVICES%2C%20I%20need%20enterprise%20IT%20support."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(16,185,129,0.55)] ring-1 ring-emerald-300/40 transition hover:scale-105"
      aria-label="WhatsApp support"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">24×7 Support</span>
    </a>
  );
}
