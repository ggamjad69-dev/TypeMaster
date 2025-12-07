import React from 'react';

// Icons
const IconLock = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
const IconCode = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);
const IconShare = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);
const IconShield = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const IconGitHub = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.304.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.879 24 17.309 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);
const IconTwitter = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.799-1.574 2.163-2.723-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.395 0-6.149 2.754-6.149 6.149 0 .482.054.953.155 1.404-5.118-.258-9.637-2.709-12.69-6.429-.533.918-.834 1.988-.834 3.128 0 2.147 1.092 4.043 2.744 5.166-.96-.03-1.85-.29-2.636-.729v.079c0 2.981 2.188 5.464 5.08 6.046-.49.134-.99.204-1.51.204-.37 0-.73-.035-1.09-.104.764 2.529 2.973 4.373 5.592 4.414-2.179 1.705-4.922 2.723-7.904 2.723-.51 0-1.01-.03-1.5-.087 2.805 1.791 6.138 2.844 9.746 2.844 11.69 0 18.125-9.696 18.125-18.125 0-.276-.005-.55-.01-.823.124-.092.247-.184.368-.276z" />
  </svg>
);

// App Details
export const APP_NAME = "Encrypted Keyboard";
export const APP_TAGLINE = "Secure Your Conversations with Substitution Encryption";
export const APP_SHORT_DESCRIPTION = "The ultimate privacy keyboard. Generate custom encryption codes, type secure messages in any app, and share keys only with those you trust. No data stored, ever.";

// Navigation Links
export const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Features", path: "/features" },
  { name: "Security", path: "/privacy" }, // Pointing to privacy/security page
  { name: "FAQ", path: "/faq" },
  { name: "Contact", path: "/contact" },
];

// Features
export const APP_FEATURES = [
  {
    id: "generate-codes",
    name: "Generate Encryption Codes",
    icon: IconCode,
    description: "Create unique substitution-based encryption keys with a single tap. Your codes are your own.",
    colorClass: "text-blue-500",
  },
  {
    id: "encrypt-decrypt",
    name: "Encrypt & Decrypt",
    icon: IconLock,
    description: "Type smoothly in any app and watch your text transform into secure code. Decrypt effortlessly when receiving messages.",
    colorClass: "text-cyan-400",
  },
  {
    id: "share-securely",
    name: "Share Codes",
    icon: IconShare,
    description: "Securely share your encryption keys with trusted contacts via QR code or direct link.",
    colorClass: "text-indigo-400",
  },
];

// FAQ Items
export const FAQ_ITEMS = [
  {
    question: "How does the encryption work?",
    answer: "It uses a substitution cipher system where each character is replaced by another based on a unique key generated on your device.",
  },
  {
    question: "Is my data stored on servers?",
    answer: "No. The keyboard operates entirely offline. We never store, read, or transmit your messages or encryption keys.",
  },
  {
    question: "Can I use this with WhatsApp or Telegram?",
    answer: "Yes! Encrypted Keyboard works as a system keyboard, so you can use it in any app including WhatsApp, Telegram, Signal, and SMS.",
  },
  {
    question: "How do I share my key with a friend?",
    answer: "The app generates a unique link or QR code for your encryption key. You can send this to your friend securely.",
  },
  {
    question: "Is it free to use?",
    answer: "The core encryption features are free. We offer a Pro version for unlimited custom keys and themes.",
  },
];

// Social Links
export const SOCIAL_LINKS = [
  { name: "GitHub", icon: IconGitHub, url: "https://github.com/encrypted-keyboard" },
  { name: "Twitter", icon: IconTwitter, url: "https://twitter.com/encrypted_key" },
];

// Footer Links
export const FOOTER_LINKS = [
  { name: "Privacy Policy", path: "/privacy" },
  { name: "Contact Us", path: "/contact" },
];

// Contact Details
export const CONTACT_EMAIL = "secure@encryptedkeyboard.app";

// Images
export const HERO_MOCKUP_IMG_LIGHT = "/assets/hero_mockup_encrypted.png"; // To be generated
export const HERO_MOCKUP_IMG_DARK = "/assets/hero_mockup_encrypted.png"; // To be generated
export const APP_MOCKUP_1 = "/assets/app_showcase_encrypted.png"; // To be generated
export const APP_MOCKUP_2 = "/assets/feature_lock.png"; // To be generated
export const APP_MOCKUP_3 = "/assets/app_showcase_encrypted.png"; // To be generated
export const DEMO_BEFORE_IMG = "/assets/hero_mockup_encrypted.png";
export const DEMO_AFTER_IMG = "/assets/hero_mockup_encrypted.png";
export const VIDEO_PLACEHOLDER_IMG = "/assets/app_showcase_encrypted.png";