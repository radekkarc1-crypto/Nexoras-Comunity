import "./globals.css";

export const metadata = {
  title: "Nexoras Community",
  description: "Games, AI, radio, ideas and community in one place.",
  manifest: "/manifest.webmanifest",
  themeColor: "#090812",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Nexoras" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
