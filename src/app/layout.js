// app/layout.js
import "./globals.css"; // Ensures global styles are applied first
import { Inter } from "next/font/google";

// Setup for Inter font (used as a fallback or specific cases in Tailwind config)
const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Ensures text remains visible during font loading
  variable: "--font-inter", // Exposes Inter as a CSS variable
});

// --- Your primary font 'MyFont' and 'Pricedown' are loaded via @font-face in globals.css ---
// --- No need to use next/font/google for them here unless they were Google Fonts themselves ---

export const metadata = {
  title: "GTA VI Countdown to Leonida",
  description: "Fan-made countdown and rumor mill for GTA VI, set in Leonida.",
  // Optional: Add more metadata for better SEO and social sharing
  // openGraph: {
  //   title: "GTA VI Countdown to Leonida",
  //   description: "Fan-made countdown and rumor mill for GTA VI, set in Leonida.",
  //   // url: 'https://your-actual-domain.com', // Replace with your actual domain
  //   // siteName: 'GTA VI Countdown',
  //   // images: [
  //   //   {
  //   //     url: 'https://your-actual-domain.com/og-image.png', // Replace with your OG image URL
  //   //     width: 1200,
  //   //     height: 630,
  //   //   },
  //   // ],
  //   // locale: 'en_US',
  //   type: 'website',
  // },
  // twitter: {
  //   card: 'summary_large_image',
  //   title: "GTA VI Countdown to Leonida",
  //   description: "Fan-made countdown and rumor mill for GTA VI, set in Leonida.",
  //   // images: ['https://your-actual-domain.com/twitter-image.png'], // Replace
  // },
  // themeColor: '#FF00C1', // Example: your gta-pink, if you want to set a theme color for browser UI
  // icons: { // For favicons etc.
  //   icon: '/favicon.ico', // Place favicon.ico in your /public folder
  //   apple: '/apple-touch-icon.png', // Place apple-touch-icon.png in your /public folder
  // },
};

export default function RootLayout({ children }) {
  return (
    // Apply the Inter font variable to the html tag for global availability.
    // 'MyFont' (your primary sans) will be applied via Tailwind's base styles from globals.css.
    // suppressHydrationWarning is often useful when className on <html> can change (e.g., for themes or font variables).
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <body>
        {/*
          It's good practice to wrap main page content in a <main> tag
          for semantic HTML and accessibility.
          Any global headers, footers, or sidebars would typically go outside <main>.
        */}
        {/* Example: <Header /> */}
        <main>{children}</main>
        {/* Example: <Footer /> */}
      </body>
    </html>
  );
}
