import React from 'react';
import GrainOverlay from '../components/GrainOverlay';

export const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-cream-1 text-text-dark pt-32 pb-24 px-6 md:px-12 xl:px-24 relative selection:bg-accent-gold/30">
      <GrainOverlay />
      
      <div className="max-w-4xl mx-auto space-y-12 text-left">
        {/* Header */}
        <div className="border-b border-text-dark/10 pb-6 space-y-2">
          <span className="text-[10px] tracking-[0.45em] font-bold text-accent-gold uppercase block">
            LEGAL ARCHIVE
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl uppercase text-text-dark leading-none">
            TERMS OF SERVICE
          </h1>
          <p className="text-xs uppercase font-mono tracking-widest text-text-dark/40">
            LAST UPDATED // JUNE 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 font-mono text-xs md:text-sm leading-relaxed text-text-dark/80">
          
          <section className="space-y-4">
            <h2 className="font-display text-lg md:text-xl text-text-dark uppercase tracking-wide">
              01 // GENERAL
              <span className="block w-8 h-[1px] bg-accent-gold mt-1" />
            </h2>
            <p className="font-light">
              This website is operated by NOSTLABEL.
            </p>
            <p className="font-light">
              By accessing or using our website, you agree to these Terms of Service and all applicable laws.
            </p>
            <p className="font-light">
              Product pricing, descriptions, availability, and specifications may change without notice.
            </p>
            
            <div className="space-y-2">
              <p className="font-bold text-accent-gold">
                NOSTLABEL RESERVES THE RIGHT TO CANCEL ORDERS INVOLVING:
              </p>
              <ul className="list-disc pl-4 space-y-1 font-light">
                <li>Pricing Errors</li>
                <li>Fraudulent Activity</li>
                <li>Inventory Shortages</li>
                <li>Violations of these Terms</li>
              </ul>
            </div>
            
            <p className="font-light italic text-text-dark/60">
              All products are intended for personal use only. Commercial resale is strictly prohibited.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg md:text-xl text-text-dark uppercase tracking-wide">
              02 // SHIPPING POLICY
              <span className="block w-8 h-[1px] bg-accent-gold mt-1" />
            </h2>
            <p className="font-light">
              We currently ship across India.
            </p>
            <p className="font-light">
              Orders are generally processed and dispatched within 2–5 business days after payment confirmation or COD verification.
            </p>
            <p className="font-light">
              Delivery times may vary based on location and courier availability.
            </p>
            <p className="font-light">
              Tracking details will be provided automatically via email and your account portal after dispatch.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg md:text-xl text-text-dark uppercase tracking-wide">
              03 // ORDER CANCELLATION
              <span className="block w-8 h-[1px] bg-accent-gold mt-1" />
            </h2>
            <p className="font-light">
              Orders may be cancelled by the user directly from their Account Portal before dispatch (when status is PENDING or CONFIRMED).
            </p>
            <p className="font-light">
              Once shipped (status changes to SHIPPED), orders cannot be cancelled.
            </p>
            <p className="font-light">
              Approved cancellations of paid orders will be refunded automatically to the original payment method.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg md:text-xl text-text-dark uppercase tracking-wide">
              04 // SIZE EXCHANGE POLICY
              <span className="block w-8 h-[1px] bg-accent-gold mt-1" />
            </h2>
            <p className="font-bold text-accent-gold uppercase tracking-wider">
              NOSTLABEL OPERATES A STRICT SIZE EXCHANGE ONLY POLICY.
            </p>
            
            <div className="space-y-2">
              <p className="font-bold">WE DO NOT OFFER:</p>
              <ul className="list-disc pl-4 space-y-1 font-light text-red-600">
                <li>Returns for Refunds</li>
                <li>Cash Refunds</li>
                <li>Store Credit for Size Issues</li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-bold">CUSTOMERS MAY REQUEST A SIZE EXCHANGE ONLY IF:</p>
              <ul className="list-disc pl-4 space-y-1 font-light">
                <li>Product is unused and in original condition</li>
                <li>Product is unwashed</li>
                <li>Original tags are fully attached</li>
                <li>Request is submitted via the portal within 7 days of delivery</li>
                <li>Requested size is currently in stock</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg md:text-xl text-text-dark uppercase tracking-wide">
              05 // DAMAGED OR INCORRECT PRODUCTS
              <span className="block w-8 h-[1px] bg-accent-gold mt-1" />
            </h2>
            <p className="font-light">
              If you receive an incorrect, damaged, or defective item, contact customer support within 48 hours of delivery.
            </p>
            <p className="font-light">
              Please provide:
            </p>
            <ul className="list-disc pl-4 space-y-1 font-light">
              <li>Order Number</li>
              <li>Clear Product Photos showing the issue</li>
              <li>A brief description of the defect or error</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg md:text-xl text-text-dark uppercase tracking-wide">
              06 // PAYMENT POLICY
              <span className="block w-8 h-[1px] bg-accent-gold mt-1" />
            </h2>
            <p className="font-light">
              Payments are processed through secure third-party payment gateways.
            </p>
            <p className="font-light">
              NOSTLABEL does not collect or store complete card or banking information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg md:text-xl text-text-dark uppercase tracking-wide">
              07 // INTELLECTUAL PROPERTY
              <span className="block w-8 h-[1px] bg-accent-gold mt-1" />
            </h2>
            <p className="font-light">
              All content on this website including:
            </p>
            <ul className="list-disc pl-4 space-y-1 font-light">
              <li>Brand Logos & Ghost Typography</li>
              <li>Product Images & Lookbook Layouts</li>
              <li>Graphics, Buttons, & Interfaces</li>
              <li>Branding, Designs, & Technical Specifications</li>
              <li>Text & Copywriting Content</li>
            </ul>
            <p className="font-light font-bold">
              is the exclusive property of NOSTLABEL and may not be copied, reproduced, or distributed without permission.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg md:text-xl text-text-dark uppercase tracking-wide">
              08 // LIMITATION OF LIABILITY
              <span className="block w-8 h-[1px] bg-accent-gold mt-1" />
            </h2>
            <p className="font-light">
              NOSTLABEL shall not be liable for indirect, incidental, or consequential damages arising from the use of our website, products, or services.
            </p>
            <p className="font-light font-bold">
              Maximum liability shall not exceed the amount paid for the product.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg md:text-xl text-text-dark uppercase tracking-wide">
              09 // GOVERNING LAW
              <span className="block w-8 h-[1px] bg-accent-gold mt-1" />
            </h2>
            <p className="font-light">
              These Terms are governed by the laws of India.
            </p>
            <p className="font-light font-bold">
              All disputes shall be subject to the exclusive jurisdiction of the courts of Delhi, India.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-text-dark/10">
            <h2 className="font-display text-lg md:text-xl text-text-dark uppercase tracking-wide">
              10 // CONTACT
              <span className="block w-8 h-[1px] bg-accent-gold mt-1" />
            </h2>
            <p className="font-light">
              For support and legal inquiries:
            </p>
            <a 
              href="mailto:support@nostlabel.com" 
              className="text-accent-gold hover:text-text-dark underline transition-colors font-bold uppercase block tracking-wider"
            >
              support@nostlabel.com
            </a>
            <p className="text-[10px] font-mono text-text-dark/50 mt-2 uppercase">
              BUSINESS HOURS: MONDAY – SATURDAY | 10:00 AM – 7:00 PM IST
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
