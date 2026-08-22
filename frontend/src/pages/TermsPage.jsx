import React from "react";
import { Link } from "react-router-dom";

const Section = ({ title, children }) => (
  <div className="border-t pt-10 mt-10" style={{ borderColor: "rgba(184,192,200,0.15)" }}>
    <div className="text-[11px] tracking-[0.4em] uppercase mb-4" style={{ color: "var(--cl-text)" }}>{title}</div>
    <div className="leading-relaxed space-y-4 text-sm md:text-base" style={{ color: "var(--cl-subtext)" }}>{children}</div>
  </div>
);

export default function TermsPage() {
  return (
    <div className="page-fade pt-32 pb-24 max-w-3xl mx-auto px-6 md:px-12">
      <div className="text-[11px] tracking-[0.3em] uppercase mb-8" style={{ color: "var(--cl-subtext)" }}>
        <Link to="/" className="hover:text-[#B8C0C8]">Home</Link> <span className="mx-2">/</span>
        <span style={{ color: "var(--cl-text)", opacity: 0.85 }}>Terms & Conditions</span>
      </div>

      <div className="text-[11px] tracking-[0.4em] uppercase mb-4" style={{ color: "var(--cl-text)" }}>Legal</div>
      <h1 className="font-serif-display text-5xl md:text-6xl leading-[0.95]" style={{ color: "var(--cl-text)" }}>
        Terms & <span className="italic" style={{ color: "var(--cl-text)" }}>Conditions</span>
      </h1>
      <p className="mt-6 text-sm leading-relaxed max-w-xl" style={{ color: "var(--cl-subtext)" }}>
        Please read these terms carefully before using crescentloom.store or placing an order with us.
      </p>
      <p className="mt-2 text-xs" style={{ color: "var(--cl-subtext)", opacity: 0.7 }}>Last updated: August 2026</p>

      <Section title="Who We Are">
        <p>
          Crescent Loom is a direct-to-consumer clothing brand. For any queries relating to these terms, you can reach us at:
        </p>
        <p>
          676, Jwala Nagar, Shahdara, Delhi – 110032<br />
          Email: <a href="mailto:crescent.looom@gmail.com" className="gold-underline" style={{ color: "var(--cl-text)" }}>crescent.looom@gmail.com</a><br />
          Phone / WhatsApp: <a href="https://wa.me/919810924300" className="gold-underline" style={{ color: "var(--cl-text)" }}>+91 98109 24300</a>
        </p>
      </Section>

      <Section title="Acceptance of Terms">
        <p>
          By accessing or using crescentloom.store, browsing our catalogue, creating an account, or placing an order, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use this website.
        </p>
      </Section>

      <Section title="Eligibility">
        <p>
          You must be at least 18 years old, or accessing this website under the supervision of a parent or legal guardian, to place an order with us.
        </p>
      </Section>

      <Section title="Products & Pricing">
        <p>
          All products are described and displayed as accurately as possible, including images, sizing, and material details. Colours may vary slightly due to screen settings and photography.
        </p>
        <p>
          Prices listed on the website are in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to change prices, product availability, and descriptions at any time without prior notice.
        </p>
      </Section>

      <Section title="Orders & Payments">
        <p>
          Once an order is placed, you will receive a confirmation via email or WhatsApp. We reserve the right to cancel or refuse any order at our discretion — for example, in cases of pricing errors, stock unavailability, or suspected fraudulent activity.
        </p>
        <p>
          Payments are processed securely through Razorpay. We do not store your card, UPI, or banking details on our servers. Cash on Delivery (full or partial token) is available on select orders, as shown at checkout.
        </p>
      </Section>

      <Section title="Shipping">
        <p>
          Shipping timelines, delivery areas, and courier details are described on our{" "}
          <Link to="/shipping" className="gold-underline" style={{ color: "var(--cl-text)" }}>Shipping & Delivery</Link> page. Delivery estimates are indicative and may vary due to courier delays, weather, or circumstances beyond our control.
        </p>
      </Section>

      <Section title="Returns & Exchanges">
        <p>
          Our return and exchange policy, including eligibility conditions and process, is detailed on our{" "}
          <Link to="/returns" className="gold-underline" style={{ color: "var(--cl-text)" }}>Returns & Exchanges</Link> page. By placing an order, you agree to these conditions.
        </p>
      </Section>

      <Section title="Loom Credits">
        <p>
          Loom Credits are a store-credit loyalty program offered at our discretion. Credits have no cash value, cannot be transferred or sold, and may be modified, paused, or discontinued at any time without prior notice. Any misuse of the program may result in forfeiture of credits.
        </p>
      </Section>

      <Section title="Intellectual Property">
        <p>
          All content on this website — including but not limited to product designs, photography, logos, text, and graphics — is the property of Crescent Loom and may not be copied, reproduced, or used without prior written permission.
        </p>
      </Section>

      <Section title="Limitation of Liability">
        <p>
          Crescent Loom shall not be held liable for any indirect, incidental, or consequential damages arising from the use of this website or our products, to the maximum extent permitted by applicable law. Our total liability for any claim shall not exceed the amount paid by you for the relevant order.
        </p>
      </Section>

      <Section title="Changes to These Terms">
        <p>
          We may update these Terms & Conditions from time to time. Continued use of the website after changes are posted constitutes acceptance of the revised terms. We recommend checking this page periodically.
        </p>
      </Section>

      <Section title="Governing Law">
        <p>
          These terms are governed by the laws of India. Any disputes arising from the use of this website or your orders shall be subject to the jurisdiction of the courts in Delhi.
        </p>
      </Section>

      <Section title="Contact Us">
        <p>
          If you have any questions about these Terms & Conditions, please reach out to us at{" "}
          <a href="mailto:crescent.looom@gmail.com" className="gold-underline" style={{ color: "var(--cl-text)" }}>crescent.looom@gmail.com</a> or{" "}
          <a href="https://wa.me/919810924300" className="gold-underline" style={{ color: "var(--cl-text)" }}>+91 98109 24300</a>.
        </p>
      </Section>

      <div className="mt-16 pt-10 border-t flex flex-wrap gap-6" style={{ borderColor: "rgba(184,192,200,0.15)" }}>
        <Link to="/shop" className="btn-gold">Continue Shopping</Link>
        <Link to="/privacy-policy" className="text-[11px] tracking-[0.3em] uppercase gold-underline self-center" style={{ color: "var(--cl-text)", opacity: 0.7 }}>Privacy Policy</Link>
      </div>
    </div>
  );
}
