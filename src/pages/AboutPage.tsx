import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Cpu, Layers } from 'lucide-react';
import { productService } from '../services/productService';
import GrainOverlay from '../components/GrainOverlay';

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const [campaignImage, setCampaignImage] = useState<string>('');
  const [loadingImage, setLoadingImage] = useState(true);

  useEffect(() => {
    const fetchCampaignImage = async () => {
      try {
        const products = await productService.getAllProducts();
        if (products.length > 0 && products[0].images && products[0].images.length > 0) {
          const firstProduct = products[0];
          const getImgUrl = (img: any) => {
            if (!img) return '';
            if (typeof img === 'string') return img;
            if (typeof img === 'object' && img.url) return img.url;
            return '';
          };
          
          let imgUrl = getImgUrl(firstProduct.images[0]);
          if (!imgUrl && firstProduct.images.length > 1) {
            imgUrl = getImgUrl(firstProduct.images[1]);
          }
          setCampaignImage(imgUrl);
        }
      } catch (err) {
        console.error("Failed to load campaign image for About page:", err);
      } finally {
        setLoadingImage(false);
      }
    };
    fetchCampaignImage();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] as const } 
    }
  };

  return (
    <div className="min-h-screen bg-bg-cream-1 text-text-dark pt-32 pb-24 px-6 md:px-12 xl:px-24 relative overflow-hidden selection:bg-accent-gold/30">
      <GrainOverlay />
      
      {/* Decorative vertical thread lines for architectural theme */}
      <div className="absolute top-0 left-1/4 w-[1px] h-full bg-text-dark/5 pointer-events-none hidden md:block" />
      <div className="absolute top-0 left-3/4 w-[1px] h-full bg-text-dark/5 pointer-events-none hidden md:block" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto space-y-24 md:space-y-36"
      >
        {/* 1. HERO SECTION */}
        <motion.section variants={itemVariants} className="text-left space-y-6 md:space-y-8 relative">
          <span className="text-[10px] tracking-[0.45em] font-bold text-accent-gold uppercase block">
            ESTABLISHED 2026 // STUDIO ARCHIVE
          </span>
          <div className="space-y-4">
            <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl uppercase leading-none text-text-dark select-none tracking-tight">
              NOSTLABEL
            </h1>
            <p className="font-mono text-xs sm:text-sm md:text-base tracking-[0.2em] text-text-dark/60 uppercase max-w-xl leading-relaxed">
              Designed To Float. <br className="sm:hidden" />
              <span className="text-accent-gold font-semibold">Built To Last.</span>
            </p>
          </div>
          
          <div className="w-16 h-[2px] bg-accent-gold mt-8" />
        </motion.section>

        {/* 2. BRAND STORY SECTION */}
        <motion.section 
          variants={itemVariants} 
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start text-left"
        >
          <div className="lg:col-span-4 space-y-2">
            <span className="text-[9px] font-mono text-accent-gold uppercase tracking-[0.3em] font-bold">01 // PHILOSOPHY</span>
            <h2 className="font-display text-3xl md:text-4xl uppercase text-text-dark">
              BRAND STORY
            </h2>
          </div>
          <div className="lg:col-span-8 space-y-6 text-sm md:text-base text-text-dark/80 font-light leading-relaxed max-w-3xl">
            <p>
              NOSTLABEL is born from a desire to strip away the noise of transient trends. We operate as an architectural design lab rather than a traditional fashion brand, engineering premium garments that exist at the intersection of structural form and everyday utility.
            </p>
            <p>
              Our streetwear philosophy rejects temporary fashion cycles. Instead, we adopt a quality-first approach to create enduring statement designs. Every fabric drop is a study in weight, texture, and durability.
            </p>
            <p>
              By embracing a minimal design language, we ensure our garments speak through their silhouette, cut, and fall. We look to brutalist and modern architecture for structural inspiration, utilizing clean geometry, asymmetric balancing, and precise technical spacing.
            </p>
          </div>
        </motion.section>

        {/* 3. CRAFTSMANSHIP BENTO GRID */}
        <motion.section variants={itemVariants} className="space-y-8 text-left">
          <div className="space-y-2">
            <span className="text-[9px] font-mono text-accent-gold uppercase tracking-[0.3em] font-bold">02 // DESIGN SPECIFICATIONS</span>
            <h2 className="font-display text-3xl md:text-4xl uppercase text-text-dark">
              CRAFTSMANSHIP
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Bento Card 1 */}
            <div className="border border-text-dark/10 p-8 bg-white/40 backdrop-blur-md flex flex-col justify-between min-h-[220px] rounded-xs group hover:border-accent-gold/20 hover:shadow-lg transition-all duration-300">
              <Layers className="text-accent-gold w-6 h-6 transition-transform group-hover:scale-110" />
              <div className="space-y-2 mt-8">
                <h3 className="font-display text-lg uppercase text-text-dark">95% Cotton + 5% Spandex</h3>
                <p className="text-[10px] font-mono text-text-dark/50 uppercase leading-normal">
                  Custom fabric blend offering absolute structural stiffness combined with fluid flexibility.
                </p>
              </div>
            </div>

            {/* Bento Card 2 */}
            <div className="border border-text-dark/10 p-8 bg-white/40 backdrop-blur-md flex flex-col justify-between min-h-[220px] rounded-xs group hover:border-accent-gold/20 hover:shadow-lg transition-all duration-300">
              <Cpu className="text-accent-gold w-6 h-6 transition-transform group-hover:scale-110" />
              <div className="space-y-2 mt-8">
                <h3 className="font-display text-lg uppercase text-text-dark">240 GSM Heavyweight</h3>
                <p className="text-[10px] font-mono text-text-dark/50 uppercase leading-normal">
                  Heavy knit density that holds its architectural silhouette and box fit throughout the day.
                </p>
              </div>
            </div>

            {/* Bento Card 3 */}
            <div className="border border-text-dark/10 p-8 bg-white/40 backdrop-blur-md flex flex-col justify-between min-h-[220px] rounded-xs group hover:border-accent-gold/20 hover:shadow-lg transition-all duration-300">
              <Sparkles className="text-accent-gold w-6 h-6 transition-transform group-hover:rotate-12" />
              <div className="space-y-2 mt-8">
                <h3 className="font-display text-lg uppercase text-text-dark">Acid Wash Finish</h3>
                <p className="text-[10px] font-mono text-text-dark/50 uppercase leading-normal">
                  Individually washed to produce unique vintage texture and complex tone variations.
                </p>
              </div>
            </div>

            {/* Bento Card 4 */}
            <div className="border border-text-dark/10 p-8 bg-white/40 backdrop-blur-md flex flex-col justify-between min-h-[220px] rounded-xs group hover:border-accent-gold/20 hover:shadow-lg transition-all duration-300 md:col-span-2 lg:col-span-1">
              <div className="text-accent-gold font-mono text-xs font-bold">[ XL-FIT ]</div>
              <div className="space-y-2 mt-8">
                <h3 className="font-display text-lg uppercase text-text-dark">Drop Shoulder Fit</h3>
                <p className="text-[10px] font-mono text-text-dark/50 uppercase leading-normal">
                  Relaxed oversized silhouette designed to float away from the body with balanced symmetry.
                </p>
              </div>
            </div>

            {/* Bento Card 5 */}
            <div className="border border-text-dark/10 p-8 bg-white/40 backdrop-blur-md flex flex-col justify-between min-h-[220px] rounded-xs group hover:border-accent-gold/20 hover:shadow-lg transition-all duration-300 md:col-span-2">
              <Shield className="text-accent-gold w-6 h-6 transition-transform group-hover:scale-110" />
              <div className="space-y-2 mt-8">
                <h3 className="font-display text-lg uppercase text-text-dark">4-Way Stretch Comfort</h3>
                <p className="text-[10px] font-mono text-text-dark/50 uppercase leading-normal">
                  High-performance retention threads ensure garments recover original sizing post wash.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 4. MISSION SECTION */}
        <motion.section 
          variants={itemVariants} 
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start text-left"
        >
          <div className="lg:col-span-4 space-y-2">
            <span className="text-[9px] font-mono text-accent-gold uppercase tracking-[0.3em] font-bold">03 // STATEMENT</span>
            <h2 className="font-display text-3xl md:text-4xl uppercase text-text-dark">
              OUR MISSION
            </h2>
          </div>
          <div className="lg:col-span-8 space-y-6 text-sm md:text-base text-text-dark/80 font-light leading-relaxed max-w-3xl">
            <p>
              Our mission is to establish a library of timeless silhouettes. We create premium streetwear that serves as a canvas of self-expression for modern creators. By optimizing our fabric weight and manufacturing standards, we deliver long-lasting garments that resist wear, washing, and fading.
            </p>
            <p>
              We believe a garment is built, not just sewn. In an era of disposable items, our collection provides structural security and enduring comfort.
            </p>
          </div>
        </motion.section>

        {/* 5. FEATURED PRODUCT CAMPAIGN VISUAL (DYNAMIC) */}
        {!loadingImage && campaignImage && (
          <motion.section variants={itemVariants} className="relative aspect-[21/9] w-full overflow-hidden border border-text-dark/5 bg-white/40 shadow-lg group">
            <img 
              src={campaignImage} 
              alt="NOSTLABEL Campaign Visual" 
              className="w-full h-full object-cover filter grayscale-[15%] transition-transform duration-[2000ms] group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-[#0F0D0A]/20 pointer-events-none" />
            <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-left text-white font-mono space-y-1">
              <span className="text-[8px] tracking-[0.35em] text-accent-gold uppercase font-bold">ACTIVE CAMPAIGN VIEW</span>
              <p className="text-xs uppercase tracking-widest font-bold">LATEST SILHOUETTE DISPLAY</p>
            </div>
          </motion.section>
        )}

        {/* 6. CALL TO ACTION (CTA) */}
        <motion.section variants={itemVariants} className="text-center py-8 max-w-lg mx-auto space-y-6">
          <div className="space-y-2">
            <h2 className="font-display text-3xl md:text-4xl uppercase text-text-dark leading-none">
              SHOP COLLECTION
            </h2>
            <p className="text-[10px] font-mono text-text-dark/50 uppercase tracking-widest">
              EXPLORE ACTIVE TECHNICAL BLUEPRINTS
            </p>
          </div>
          <button
            onClick={() => navigate('/collections')}
            className="w-full bg-text-dark text-white hover:bg-transparent hover:text-text-dark py-4 text-[10px] font-bold tracking-[0.25em] uppercase transition-all duration-300 cursor-pointer border border-text-dark flex items-center justify-center space-x-2"
          >
            <span>EXPLORE PRODUCTS</span>
            <ArrowRight size={12} className="ml-1" />
          </button>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default AboutPage;
