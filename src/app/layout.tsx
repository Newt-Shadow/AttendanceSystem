import { Inter } from "next/font/google";
import "~/styles/globals.css";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "~/styles/theme";
import { Header } from "~/app/_components/Header";
import { TRPCReactProvider } from "~/trpc/react"; // <-- Add this

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "GeoAttend",
  description: "Geolocation-based attendance tracking system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
      
          <TRPCReactProvider>
            <Header />
            <main className="container mx-auto p-4">{children}</main>
          </TRPCReactProvider>
     
      </body>
    </html>
  );
}
