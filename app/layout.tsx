export const metadata = {
  title: "Suivi Auto-Entrepreneur",
  description: "Gère ton chiffre d'affaires, tes cotisations et tes seuils en un coup d'oeil",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
