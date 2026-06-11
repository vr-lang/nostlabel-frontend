import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import type { Product } from '../data/products';
import { getActiveOffers, calculateOfferDiscount } from '../utils/offerHelper';
import type { Offer } from '../utils/offerHelper';

export interface CartItem {
  product: Product;
  quantity: number;
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  color: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number, size: string, color: string) => void;
  onRemoveItem: (productId: string, size: string, color: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  const [activeOffers, setActiveOffers] = useState<Offer[]>([]);

  useEffect(() => {
    const fetchOffers = async () => {
      const list = await getActiveOffers();
      setActiveOffers(list);
    };
    if (isOpen) {
      fetchOffers();
    }
  }, [isOpen]);

  // Find offer that gives max discount
  let offerDiscountAmount = 0;
  let appliedOffer: Offer | null = null;

  for (const offer of activeOffers) {
    const res = calculateOfferDiscount(cartItems, offer);
    if (res.discountAmount > offerDiscountAmount) {
      offerDiscountAmount = res.discountAmount;
      appliedOffer = res.appliedOffer;
    }
  }

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.discountPrice || item.product.price) * item.quantity, 0);
  const total = subtotal - offerDiscountAmount;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-bg-cream-2 border-l border-text-dark/10 shadow-2xl z-50 flex flex-col justify-between overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-text-dark/10 flex justify-between items-center bg-bg-cream-1">
          <div className="flex items-center space-x-2.5">
            <ShoppingBag size={18} className="text-text-dark" />
            <span className="font-display text-xl uppercase tracking-wider text-text-dark">YOUR BAG</span>
            <span className="text-[10px] font-mono bg-text-dark/5 px-2 py-0.5 rounded-full text-text-dark/60">
              {cartItems.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-black/5 rounded-full text-text-dark transition-colors"
            aria-label="Close Cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 text-center py-20">
              <ShoppingBag size={48} className="text-text-dark/20 stroke-[1px]" />
              <p className="text-xs uppercase tracking-widest text-text-dark/40 font-mono">
                Your bag is empty
              </p>
              <button
                onClick={onClose}
                className="text-xs uppercase tracking-[0.2em] font-bold text-accent-gold hover:text-text-dark transition-colors"
              >
                CONTINUE BROWSING
              </button>
            </div>
          ) : (
            cartItems.map((item, index) => (
              <div
                key={`${item.product.id}-${item.size}-${item.color}-${index}`}
                className="flex space-x-4 border-b border-text-dark/5 pb-6 items-start"
              >
                {/* Product Thumbnail */}
                <div className="w-20 aspect-[3/4] bg-[#F2ECE4] border border-black/5 overflow-hidden shrink-0">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-grow text-left space-y-1.5">
                  <h4 className="font-display text-base uppercase text-text-dark leading-tight">
                    {item.product.name}
                  </h4>
                  <p className="text-[10px] font-mono text-text-dark/40 uppercase">
                    SIZE: {item.size} • COLOR: {item.color}
                  </p>
                  
                  {/* Quantity Counter */}
                  <div className="flex items-center space-x-3 pt-1">
                    <div className="flex items-center border border-text-dark/15 rounded-sm p-0.5 bg-bg-cream-1">
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.product.id, item.quantity - 1, item.size, item.color)
                        }
                        className="p-1 hover:bg-black/5 rounded-sm text-text-dark/60"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={10} />
                      </button>
                      <span className="text-[10px] font-mono font-bold w-6 text-center text-text-dark">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.product.id, item.quantity + 1, item.size, item.color)
                        }
                        className="p-1 hover:bg-black/5 rounded-sm text-text-dark/60"
                      >
                        <Plus size={10} />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.product.id, item.size, item.color)}
                      className="text-text-dark/40 hover:text-red-500 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Pricing */}
                <div className="text-right flex flex-col justify-between h-full">
                  {item.product.discountPrice ? (
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-mono font-semibold text-accent-gold">
                        ₹{(item.product.discountPrice * item.quantity).toLocaleString()}
                      </span>
                      <span className="text-[10px] font-mono text-text-dark/40 line-through">
                        ₹{(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs font-mono font-semibold text-text-dark">
                      ₹{(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pricing Summary Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 bg-bg-cream-1 border-t border-text-dark/10 space-y-6">
            
            {/* Calculations */}
            <div className="space-y-2.5 pt-2 border-t border-text-dark/5 text-xs">
              <div className="flex justify-between font-mono text-text-dark/50">
                <span>SUBTOTAL</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>

              {offerDiscountAmount > 0 && (
                <div className="flex flex-col space-y-1 py-1 font-mono text-green-600 border-t border-b border-text-dark/5 my-1.5">
                  <div className="flex justify-between font-bold">
                    <span>OFFER DISCOUNT</span>
                    <span>-₹{offerDiscountAmount.toLocaleString()}</span>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-green-600/70 text-left font-bold">
                    {appliedOffer && (appliedOffer.title.includes('2 T-SHIRTS FOR') || appliedOffer.title.includes('2 FOR ₹1400'))
                      ? 'NOSTLABEL 2 FOR ₹1400 OFFER APPLIED' 
                      : `${appliedOffer?.title || 'OFFER'} APPLIED`}
                  </span>
                </div>
              )}

              <div className="flex justify-between font-mono text-text-dark/40">
                <span>SHIPPING</span>
                <span>FREE</span>
              </div>
              <div className="flex justify-between font-mono font-bold text-text-dark text-sm border-t border-text-dark/5 pt-2.5">
                <span>TOTAL</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={() => onCheckout()}
              className="w-full bg-text-dark text-white text-xs uppercase font-bold tracking-[0.25em] py-4 flex items-center justify-center space-x-2 border border-text-dark hover:bg-transparent hover:text-text-dark transition-all duration-300 hover-trigger"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

      </div>
    </>
  );
};

export default CartDrawer;
