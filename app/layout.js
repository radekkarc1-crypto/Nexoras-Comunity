import "./globals.css";

export const metadata = {
  title: "Nexoras Community",
  description: "Games, AI, radio, ideas and community in one place.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
