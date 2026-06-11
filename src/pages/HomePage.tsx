import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../sections/Hero';
import Manifesto from '../sections/Manifesto';
import ScrollStory from '../sections/ScrollStory';
import SplitCraft from '../sections/SplitCraft';
import PinnedWords from '../sections/PinnedWords';
import FeaturedCollection from '../sections/FeaturedCollection';
import BestSellers from '../sections/BestSellers';
import WhyNostlabel from '../sections/WhyNostlabel';
import BrandStory from '../sections/BrandStory';
import type { Product } from '../data/products';
import HomepageOfferSection from '../components/HomepageOfferSection';
import { API_BASE_URL } from '../config/api';

interface HomePageProps {
  onAddToCart: (product: Product, size: 'S' | 'M' | 'L' | 'XL' | 'XXL', color: string) => void;
  onProductClick: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onAddToCart, onProductClick }) => {
  const location = useLocation();
  const [homepageOffer, setHomepageOffer] = useState<any | null>(null);

  // Fetch Homepage Offer Banner Details
  useEffect(() => {
    const fetchHomepageOffer = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/homepage-offer`);
        if (response.ok) {
          const res = await response.json();
          if (res.success && res.data) {
            setHomepageOffer(res.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch homepage offer:', err);
      }
    };
    fetchHomepageOffer();
  }, []);

  const isOfferActive = () => {
    if (!homepageOffer || !homepageOffer.isActive) return false;
    const now = new Date();
    return now >= new Date(homepageOffer.startDate) && now <= new Date(homepageOffer.endDate);
  };
  
  // Custom scroll reset or scroll to state section on load
  useEffect(() => {
    if (location.state && (location.state as any).scrollToSection) {
      const sectionId = (location.state as any).scrollToSection;
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      // Clear navigation state
      window.history.replaceState({}, document.title);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  const handleNavigateToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const showOffer = isOfferActive();

  return (
    <>
      {showOffer && (
        <HomepageOfferSection
          offer={homepageOffer}
          isFirstSection={true}
        />
      )}
      <Hero
        isFirstSection={!showOffer}
        onShopClick={() => handleNavigateToSection('bestsellers')}
        onExploreClick={() => handleNavigateToSection('manifesto')}
        onAddToCart={onAddToCart}
      />
      <Manifesto />
      <ScrollStory />
      <SplitCraft onLearnMoreClick={() => handleNavigateToSection('why-nostlabel')} />
      <PinnedWords />
      <FeaturedCollection onCategoryClick={() => handleNavigateToSection('bestsellers')} />
      <BestSellers onProductClick={onProductClick} onAddToCart={onAddToCart} />
      <WhyNostlabel />
      <BrandStory />
    </>
  );
};

export default HomePage;
