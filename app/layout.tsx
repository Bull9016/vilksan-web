import type { Metadata } from "next";
import { Inter, Outfit, Playfair_Display, Oswald, Courier_Prime, Cinzel, Montserrat } from "next/font/google";
import "./globals.css";
import { AdminProvider } from "@/context/AdminContext";
import { CartProvider } from "@/context/CartContext";
import SiteHeader from "@/components/layout/SiteHeader";
import FooterWrapper from "@/components/layout/FooterWrapper";
import CartDrawer from "@/components/ui/CartDrawer";
import { Toaster } from "sonner";
import { getContent } from "@/app/actions/content";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

const courier = Courier_Prime({
  variable: "--font-courier",
  weight: "400",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vilksan | Premium E-Commerce",
  description: "Authentic, Real, Raw.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch Footer Content
  const footerKeys = [
    "footer_hero_text",
    "footer_cta_heading",
    "footer_cta_subheading",
    "footer_col_1_links",
    "footer_col_2_links",
    "footer_col_3_links",
  ];

  const footerEntries = await Promise.all(
    footerKeys.map(async (key) => {
      const data = await getContent(key);
      return [key, data];
    })
  );

  const footerContent = Object.fromEntries(footerEntries);

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} ${playfair.variable} ${oswald.variable} ${courier.variable} ${cinzel.variable} ${montserrat.variable} antialiased bg-background text-foreground`}
      >
        <AdminProvider>
          <CartProvider>
            <SiteHeader />
            <CartDrawer />
            {children}
            <FooterWrapper content={footerContent} />
            <Toaster position="top-center" />
          </CartProvider>
        </AdminProvider>
      </body>
    </html>
  );
}
