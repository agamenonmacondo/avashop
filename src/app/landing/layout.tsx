import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Combo PRO - Audio Dual y Estabilización',
  description: 'Combo profesional con audio dual y estabilización inteligente. Incluye Gimbal KOOSDA KM03 y Micrófono REMAX K18.',
  openGraph: {
    title: 'Combo PRO - CCS724',
    description: 'Combo profesional con audio dual y estabilización inteligente',
    images: ['/images/combos/combo_1/combo1.png'],
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}