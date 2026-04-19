import styles from './page.module.css';
import { HeroSection } from '@/components/features/landing/components/HeroSection';
import { FeaturesSection } from '@/components/features/landing/components/FeaturesSection';
import { ContactSection } from '@/components/features/landing/components/ContactSection';

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <HeroSection videoSrc="/recording/landing-page-loop.mov" />
      <FeaturesSection />
      <ContactSection />
    </div>
  );
}
