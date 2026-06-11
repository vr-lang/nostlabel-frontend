import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { productService, type Category } from '../services/productService';
import type { Product } from '../data/products';
import GrainOverlay from '../components/GrainOverlay';

const NOSTLABEL_PLACEHOLDER = "/logo.png";

export const CollectionDetailPage: React.FC<{ onProductClick: (product: Product) => void }> = ({ onProductClick }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchCollectionDetails = async () => {
      try {
        if (!slug) return;
        const [cats, allProds] = await Promise.all([
          productService.getCategories(),
          productService.getAllProducts()
        ]);

        if (!active) return;

        if (slug === 'oversized-tees') {
          const catName = "Oversized Tees";
          const description = "Premium oversized t-shirts engineered from heavyweight organic cotton with architectural drape and drop shoulder styling.";
          const image = allProds[0]?.images?.[0] || NOSTLABEL_PLACEHOLDER;
          setCategory({
            id: 'oversized-tees',
            name: catName,
            slug: slug,
            description: description,
            image: image,
            status: "ACTIVE"
          });
          setProducts(allProds);
        } else {
          // Find matching category
          const cat = cats.find(c => c.slug === slug);
          let catName = "";
          let description = "Minimal silhouettes engineered through precision stitching and premium fabrics.";
          let image = "";

          if (cat) {
            setCategory(cat);
            catName = cat.name;
            description = cat.description || description;
            image = cat.image || "";
          } else {
            // Fallback guess from slug
            catName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            // Try exact matches in database categories
            const guessedCatName = cats.find(c => c.name.toLowerCase() === catName.toLowerCase());
            if (guessedCatName) {
              setCategory(guessedCatName);
              catName = guessedCatName.name;
            }
          }

          const filteredProds = allProds.filter(p => p.category.toLowerCase() === catName.toLowerCase());
          
          if (filteredProds.length > 0) {
            setProducts(filteredProds);
            setCategory({
              id: slug,
              name: catName,
              slug: slug,
              description: description,
              image: image || filteredProds[0]?.images[0],
              status: "ACTIVE"
            });
          } else {
            setProducts([]);
            setCategory({
              id: slug,
              name: catName,
              slug: slug,
              description: description,
              image: image || NOSTLABEL_PLACEHOLDER,
              status: "ACTIVE"
            });
          }
        }
      } catch (err) {
        console.error("Failed to load collection details:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchCollectionDetails();
    return () => {
      active = false;
    };
  }, [slug]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 80, damping: 15 }
    }
  };

  const isPageLoading = loading;

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-bg-cream-1 pt-32 pb-24 px-6 md:px-12 xl:px-24 animate-pulse">
        <div className="max-w-7xl mx-auto space-y-4 mb-16 shadow-xs">
          <div className="h-4 bg-text-dark/5 w-16 rounded-xs" />
          <div className="h-14 bg-text-dark/10 w-1/2 rounded-xs" />
          <div className="h-4 bg-text-dark/5 w-2/3 rounded-xs" />
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-4 shadow-xs">
              <div className="aspect-[3/4] w-full bg-text-dark/5 rounded-xs" />
              <div className="h-4 bg-text-dark/10 w-2/3 rounded-xs" />
              <div className="h-3 bg-text-dark/5 w-1/3 rounded-xs" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!category || products.length === 0) {
    return (
      <div className="min-h-screen bg-bg-cream-1 flex flex-col items-center justify-center px-6 text-center pt-20">
        <h2 className="font-display text-3xl md:text-4xl uppercase tracking-wider text-text-dark mb-2">
          Collection Empty
        </h2>
        <p className="text-xs md:text-sm text-text-dark/60 font-light font-mono max-w-md mb-8">
          This collection does not contain any active designs at the moment.
        </p>
        <button
          onClick={() => navigate('/collections')}
          className="flex items-center space-x-2 bg-text-dark text-white text-[10px] uppercase font-bold tracking-[0.25em] px-8 py-4 border border-text-dark hover:bg-transparent hover:text-text-dark transition-all duration-300"
        >
          <ArrowLeft size={12} />
          <span>Return to Collections</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-cream-1 pt-32 pb-24 px-6 md:px-12 xl:px-24 relative selection:bg-accent-gold/30">
      <GrainOverlay />
      
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Breadcrumb Navigation */}
        <button
          onClick={() => navigate('/collections')}
          className="flex items-center space-x-2 text-[9px] font-mono font-bold tracking-widest text-text-dark/40 hover:text-accent-gold transition-colors uppercase"
        >
          <ArrowLeft size={12} />
          <span>Back to Collections</span>
        </button>

        {/* Collection Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start border-b border-text-dark/10 pb-12">
          <div className="lg:col-span-8 space-y-4 text-left">
            <span className="text-[10px] tracking-[0.45em] font-bold text-accent-gold uppercase block">
              COLLECTION BLUEPRINT
            </span>
            <h1 className="font-display text-4xl md:text-6xl uppercase text-text-dark leading-none">
              {category.name}
            </h1>
            <p className="text-xs md:text-sm text-text-dark/70 font-light leading-relaxed max-w-2xl">
              {category.description}
            </p>
          </div>
          <div className="lg:col-span-4 flex lg:justify-end lg:text-right mt-4 lg:mt-0 font-mono text-[10px] text-text-dark/40 tracking-widest uppercase">
            <span>[ {products.length} SILHOUETTES IN ARCHIVE ]</span>
          </div>
        </div>

        {/* Products Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-6 md:gap-y-16"
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              onClick={() => onProductClick(product)}
              className="group flex flex-col space-y-4 text-left relative cursor-pointer"
            >
              {/* Image Container */}
              <div className="aspect-[3/4] w-full bg-[#F2ECE4] overflow-hidden border border-text-dark/5 relative shadow-sm transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-lg group-hover:border-accent-gold/20">
                <img
                  src={product.images[0] || NOSTLABEL_PLACEHOLDER}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter grayscale-[20%] group-hover:grayscale-0"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-bg-dark-1/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Details */}
              <div className="space-y-1.5 transition-transform duration-500 group-hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono tracking-widest text-text-dark/40 uppercase">
                    {product.category}
                  </span>
                  <span className="text-[10px] font-mono text-accent-gold font-semibold">
                    ₹{product.price.toLocaleString()}
                  </span>
                </div>
                <h3 className="font-display text-lg md:text-xl uppercase text-text-dark leading-tight group-hover:text-accent-gold transition-colors duration-300">
                  {product.name}
                </h3>
                
                {/* Hover text reveal */}
                <div className="relative overflow-hidden h-4">
                  <p className="text-[9px] font-mono text-text-dark/50 transition-all duration-300 transform group-hover:-translate-y-full">
                    {product.material} • {product.gsm}
                  </p>
                  <p className="absolute top-0 left-0 text-[9px] font-mono text-accent-gold font-bold tracking-widest uppercase transition-all duration-300 transform translate-y-full group-hover:translate-y-0 flex items-center space-x-1">
                    <span>EXPLORE SILHOUETTE</span>
                    <span>→</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default CollectionDetailPage;
