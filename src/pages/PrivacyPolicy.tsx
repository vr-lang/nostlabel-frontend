import React from 'react';
import GrainOverlay from '../components/GrainOverlay';

export const PrivacyPolicy: React.FC = () => {
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
            PRIVACY POLICY
          </h1>
          <p className="text-xs uppercase font-mono tracking-widest text-text-dark/40">
            LAST UPDATED // JUNE 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 font-mono text-xs md:text-sm leading-relaxed text-text-dark/80">
          
          <section className="space-y-4">
            <h2 className="font-display text-lg md:text-xl text-text-dark uppercase tracking-wide">
              01 // INTRODUCTION
              <span className="block w-8 h-[1px] bg-accent-gold mt-1" />
            </h2>
            <p className="font-light">
              NOSTLABEL respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and safeguard your information when you visit our website, create an account, place an order, request a size exchange, or interact with our services.
            </p>
            <p className="font-light">
              By using the NOSTLABEL website, you agree to the practices described in this Privacy Policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg md:text-xl text-text-dark uppercase tracking-wide">
              02 // INFORMATION WE COLLECT
              <span className="block w-8 h-[1px] bg-accent-gold mt-1" />
            </h2>
            <p className="font-light">
              We may collect the following classifications of data to provide our services:
            </p>
            
            <div className="space-y-4 pl-4 border-l border-text-dark/10">
              <div>
                <h3 className="font-bold text-text-dark uppercase tracking-wider text-[11px] mb-1">
                  // PERSONAL INFORMATION
                </h3>
                <ul className="list-disc pl-4 space-y-1 font-light">
                  <li>Full Name</li>
                  <li>Email Address</li>
                  <li>Phone Number</li>
                  <li>Shipping Address</li>
                  <li>Billing Address</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-text-dark uppercase tracking-wider text-[11px] mb-1">
                  // ACCOUNT INFORMATION
                </h3>
                <ul className="list-disc pl-4 space-y-1 font-light">
                  <li>Login Credentials</li>
                  <li>Profile Information</li>
                  <li>Saved Addresses</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-text-dark uppercase tracking-wider text-[11px] mb-1">
                  // ORDER INFORMATION
                </h3>
                <ul className="list-disc pl-4 space-y-1 font-light">
                  <li>Products Purchased</li>
                  <li>Order History</li>
                  <li>Exchange Requests</li>
                  <li>Payment Information</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-text-dark uppercase tracking-wider text-[11px] mb-1">
                  // DEVICE INFORMATION
                </h3>
                <ul className="list-disc pl-4 space-y-1 font-light">
                  <li>IP Address</li>
                  <li>Browser Type</li>
                  <li>Device Type</li>
                  <li>Usage Information</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg md:text-xl text-text-dark uppercase tracking-wide">
              03 // HOW WE USE YOUR INFORMATION
              <span className="block w-8 h-[1px] bg-accent-gold mt-1" />
            </h2>
            <p className="font-light">
              Your information is utilized exclusively for the following operational workflows:
            </p>
            <ul className="list-disc pl-4 space-y-1 font-light">
              <li>Process Orders</li>
              <li>Deliver Products</li>
              <li>Manage Accounts</li>
              <li>Handle Size Exchanges</li>
              <li>Send OTP Verification Emails</li>
              <li>Send Order Updates</li>
              <li>Improve User Experience</li>
              <li>Prevent Fraud</li>
              <li>Provide Customer Support</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg md:text-xl text-text-dark uppercase tracking-wide">
              04 // COOKIES
              <span className="block w-8 h-[1px] bg-accent-gold mt-1" />
            </h2>
            <p className="font-light">
              We may use cookies and similar tracking identifiers to:
            </p>
            <ul className="list-disc pl-4 space-y-1 font-light">
              <li>Maintain Secure Login Sessions</li>
              <li>Improve Platform Performance</li>
              <li>Remember User Preferences</li>
              <li>Analyze Website Usage and Telemetry</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg md:text-xl text-text-dark uppercase tracking-wide">
              05 // INFORMATION SHARING
              <span className="block w-8 h-[1px] bg-accent-gold mt-1" />
            </h2>
            <p className="font-bold text-accent-gold uppercase tracking-wider mb-2">
              We do not sell customer data.
            </p>
            <p className="font-light">
              Operational information may be securely shared with the following third-party integrations:
            </p>
            <ul className="list-disc pl-4 space-y-1 font-light">
              <li>Payment Gateways & Providers</li>
              <li>Shipping & Logistics Partners</li>
              <li>Cloudinary (Profile Images)</li>
              <li>Email Service Providers (Resend OTPs)</li>
              <li>Legal Authorities when strictly required by law</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg md:text-xl text-text-dark uppercase tracking-wide">
              06 // DATA SECURITY
              <span className="block w-8 h-[1px] bg-accent-gold mt-1" />
            </h2>
            <p className="font-light">
              We implement industry-standard database protection protocols:
            </p>
            <ul className="list-disc pl-4 space-y-1 font-light">
              <li>Encrypted Passwords (salted hashes)</li>
              <li>Secure JWT Token-Based Authentication</li>
              <li>Protected Database Connections</li>
              <li>Restricted Data Access Controls</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg md:text-xl text-text-dark uppercase tracking-wide">
              07 // YOUR RIGHTS
              <span className="block w-8 h-[1px] bg-accent-gold mt-1" />
            </h2>
            <p className="font-light">
              You are entitled to request:
            </p>
            <ul className="list-disc pl-4 space-y-1 font-light">
              <li>Access to Your Stored Information</li>
              <li>Correction of Outdated or Incorrect Information</li>
              <li>Complete Account & Profile Deletion</li>
              <li>Communication Preference & Notification Changes</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg md:text-xl text-text-dark uppercase tracking-wide">
              08 // CHILDREN'S PRIVACY
              <span className="block w-8 h-[1px] bg-accent-gold mt-1" />
            </h2>
            <p className="font-light">
              NOSTLABEL does not knowingly collect information from individuals under 18 years of age.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-text-dark/10">
            <h2 className="font-display text-lg md:text-xl text-text-dark uppercase tracking-wide">
              09 // CONTACT
              <span className="block w-8 h-[1px] bg-accent-gold mt-1" />
            </h2>
            <p className="font-light">
              For privacy-related inquiries or data requests, reach out directly:
            </p>
            <a 
              href="mailto:support@nostlabel.com" 
              className="text-accent-gold hover:text-text-dark underline transition-colors font-bold uppercase block tracking-wider"
            >
              support@nostlabel.com
            </a>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
