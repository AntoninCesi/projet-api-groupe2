import { Bricolage_Grotesque, Hanken_Grotesk } from 'next/font/google';
import './globals.css';
import { FollowedThemesProvider } from '@/components/FollowedThemes';

const title = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-title' });
const body = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-body' });

export const metadata = {
  title: 'Trend by Breezy',
  description: "Le réseau social qui prend la température de l'actu.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${title.variable} ${body.variable}`}>
      <body className="font-body">
        <FollowedThemesProvider>{children}</FollowedThemesProvider>
      </body>
    </html>
  );
}
