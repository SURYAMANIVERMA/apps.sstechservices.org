declare const __BUILD_TIME__: string;
declare const __BUILD_HASH__: string;

export const BUILD_TIME: string =
  typeof __BUILD_TIME__ !== "undefined" ? __BUILD_TIME__ : new Date().toISOString();
export const BUILD_HASH: string =
  typeof __BUILD_HASH__ !== "undefined" ? __BUILD_HASH__ : "dev";

export const ROUTES: { path: string; label: string }[] = [
  { path: "/", label: "Home" },
  { path: "/pricing", label: "Pricing" },
  { path: "/download", label: "Download" },
  { path: "/payment", label: "Payment" },
  { path: "/auth", label: "Sign in" },
  { path: "/app", label: "Dashboard" },
  { path: "/admin", label: "Admin" },
  { path: "/setup-guide", label: "Setup Guide" },
];

export const ASSETS: { name: string; path: string }[] = [
  { name: "Brand logo", path: "src/assets/sstech-logo.png" },
  { name: "Windows installer", path: "src/assets/sstech-nexeus-windows.zip" },
];
