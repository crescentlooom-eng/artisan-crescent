import React from "react";
import { Link } from "react-router-dom";

const Section = ({ title, children }) => (
  <div className="border-t pt-10 mt-10" style={{ borderColor: "rgba(184,192,200,0.15)" }}>
    <div className="text-[11px] tracking-[0.4em] uppercase mb-4" style={{ color: "var(--cl-text)" }}>{title}</div>
    <div className="leading-relaxed space-y-4 text-sm md:text-base" style={{ color: "var(--cl-subtext)" }}>{children}</div>
  </div>
);

export default function PrivacyPage() {
  return (
    <div className="page-fade pt-32 pb-24 max-w-3xl mx-auto px-6 md:px-12">
      <div className="text-[11px] tracking-[0.3em] uppercase mb-8" style={{ color: "var(--cl-subtext)" }}>
        <Link to="/" className="hover:text-[#B8C0C8]">Home</Link> <span className="mx-2">/</span>
        <span style={{ color: "var(--cl-text)", opacity: 0.85 }}>Privacy Policy</span>
      </div>

      <div className="text-[11px] tracking-[0.4em] uppercase mb-4" style={{ color: "var(--cl-text)" }}>Legal</div>
      <h1 className="font-serif-display text-5xl md:text-6xl leading-[0.95]" style={{ color: "var(--cl-text)" }}>
        Privacy <span className="italic" style={{ color: "var(--cl-text)" }}>Policy</span>
      </h1>
      <p className="mt-6 text-sm leading-relaxed max-w-xl" style={{ color: "var(--cl-subtext)" }}>
        Your privacy matters to us. This page explains what information we collect, how we use it, and the choices you have.
      </p>
      <p className="mt-2 text-xs" style={{ color: "var(--cl-subtext)", opacity: 0.7 }}>Last updated: August 2026</p>

      <Section title="Who We Are">
        <p>
          Crescent Loom operates crescentloom.store. For any privacy-related questions, you can reach us at:
        </p>
        <p>
          676, Jwala Nagar, Shahdara, Delhi – 110032<br />
          Email: <a href="mailto:crescent.looom@gmail.com" className="gold-underline" style={{ color: "var(--cl-text)" }}>crescent.looom@gmail.com</a><br />
          Phone / WhatsApp: <a href="https://wa.me/919810924300" className="gold-underline" style={{ color: "var(--cl-text)" }}>+91 98109 24300</a>
        </p>
      </Section>

      <Section title="Information We Collect">
        <p>When you browse our website, create an account, or place an order, we may collect:</p>
        <ul className="space-y-2 mt-2">
          {[
            "Name, email address, phone number, and delivery address",
            "Order history and preferences (e.g. sizes, wishlist items)",
            "Profile picture, if you choose to upload one",
            "Payment confirmation details from Razorpay (we do not store your card, UPI, or bank details)",
            "Basic technical data such as browser type, device, and pages visited, via cookies and analytics tools",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-1" style={{ color: "var(--cl-text)" }}>—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="How We Use Your Information">
        <ul className="space-y-2 mt-2">
          {[
            "To process and deliver your orders",
            "To communicate order updates, delivery tracking, and support queries via email or WhatsApp",
            "To manage your account, wishlist, and Loom Credits balance",
            "To improve our website, products, and customer experience",
            "To run advertising and measure its effectiveness (see 'Cookies & Advertising' below)",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-1" style={{ color: "var(--cl-text)" }}>—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Third-Party Services We Use">
        <p>We work with trusted third-party services to run our store. Each processes a limited set of data necessary for their function:</p>
        <ul className="space-y-2 mt-2">
          {[
            "Razorpay — for secure payment processing",
            "Delhivery — for order shipping and delivery, using your name, address, and phone number",
            "Cloudinary — for hosting product images",
            "Meta (Facebook/Instagram) Pixel — for advertising and measuring ad performance, using hashed, non-identifiable data where possible",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-1" style={{ color: "var(--cl-text)" }}>—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>
          These providers have their own privacy policies governing how they handle data, and we encourage you to review them if you have concerns.
        </p>
      </Section>

      <Section title="Cookies & Advertising">
        <p>
          We use cookies and similar technologies to keep you signed in, remember your preferences (like light/dark theme), and understand how our website is used. We also use tools like Meta Pixel to measure the performance of our ads and show relevant offers. You can control or disable cookies through your browser settings, though some features of the site may not work as intended if you do.
        </p>
      </Section>

      <Section title="Data Storage & Security">
        <p>
          Your data is stored on secure, industry-standard infrastructure (MongoDB Atlas, hosted via Render). We take reasonable technical and organisational measures to protect your information, but no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.
        </p>
      </Section>

      <Section title="Data Retention">
        <p>
          We retain your account and order information for as long as your account is active, or as needed to comply with legal obligations, resolve disputes, and enforce our agreements. You may request deletion of your account and associated data at any time by contacting us.
        </p>
      </Section>

      <Section title="Your Rights">
        <p>You can, at any time:</p>
        <ul className="space-y-2 mt-2">
          {[
            "Access or update your account details from your Account page",
            "Request a copy of the personal data we hold about you",
            "Request correction or deletion of your personal data",
            "Withdraw consent for marketing communications",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-1" style={{ color: "var(--cl-text)" }}>—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>To exercise any of these rights, email us at <a href="mailto:crescent.looom@gmail.com" className="gold-underline" style={{ color: "var(--cl-text)" }}>crescent.looom@gmail.com</a>.</p>
      </Section>

      <Section title="Children's Privacy">
        <p>
          Our website is not intended for children under 18. We do not knowingly collect personal information from minors. If you believe a minor has provided us with personal data, please contact us so we can remove it.
        </p>
      </Section>

      <Section title="Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons. We encourage you to review this page periodically. Continued use of the website after changes are posted constitutes acceptance of the revised policy.
        </p>
      </Section>

      <Section title="Contact Us">
        <p>
          If you have any questions about this Privacy Policy or how we handle your data, please reach out to us at{" "}
          <a href="mailto:crescent.looom@gmail.com" className="gold-underline" style={{ color: "var(--cl-text)" }}>crescent.looom@gmail.com</a> or{" "}
          <a href="https://wa.me/919810924300" className="gold-underline" style={{ color: "var(--cl-text)" }}>+91 98109 24300</a>.
        </p>
      </Section>

      <div className="mt-16 pt-10 border-t flex flex-wrap gap-6" style={{ borderColor: "rgba(184,192,200,0.15)" }}>
        <Link to="/shop" className="btn-gold">Continue Shopping</Link>
        <Link to="/terms" className="text-[11px] tracking-[0.3em] uppercase gold-underline self-center" style={{ color: "var(--cl-text)", opacity: 0.7 }}>Terms & Conditions</Link>
      </div>
    </div>
  );
}
