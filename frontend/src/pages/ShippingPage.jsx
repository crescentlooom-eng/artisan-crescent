import React from "react";
import { Link } from "react-router-dom";

const Section = ({ title, children }) => (
  <div className="border-t border-[#C9A96E]/15 pt-10 mt-10">
    <div className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E] mb-4">{title}</div>
    <div className="text-[#F5F0E8]/80 leading-relaxed space-y-4 text-sm md:text-base">{children}</div>
  </div>
);

export default function ShippingPage() {
  return (
    <div className="page-fade pt-32 pb-24 max-w-3xl mx-auto px-6 md:px-12">
      <div className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E] mb-4">Delivery</div>
      <h1 className="font-serif-display text-5xl md:text-6xl text-[#F5F0E8] leading-[0.95]">
        Shipping & <span className="italic text-[#C9A96E]/90">Delivery</span>
      </h1>
      <p className="text-[#F5F0E8]/60 mt-6 text-sm leading-relaxed max-w-xl">
        Every piece is packed with care and dispatched promptly. Here's what to expect after you place your order.
      </p>

      <Section title="Delivery Areas">
        <p>
          We currently deliver within <strong className="text-[#F5F0E8]">Delhi NCR</strong> only. This includes Delhi, Noida, Greater Noida, Gurgaon, Faridabad, and Ghaziabad.
        </p>
        <p className="text-[#F5F0E8]/50 text-xs tracking-wide">
          Pan-India shipping is coming soon. Stay tuned.
        </p>
      </Section>

      <Section title="Shipping Charges">
        <p>
          We offer <strong className="text-[#F5F0E8]">free shipping</strong> on all orders within Delhi NCR. No minimum order value required.
        </p>
      </Section>

      <Section title="Delivery Time">
        <p>
          Orders are typically delivered within <strong className="text-[#F5F0E8]">2–4 business days</strong> of placement.
        </p>
        <ul className="space-y-2 mt-2">
          {[
            "Orders placed before 12 PM are dispatched the same day",
            "Orders placed after 12 PM are dispatched the next business day",
            "Delivery may take longer during sale periods or public holidays",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="text-[#C9A96E] mt-1">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Our Courier Partner">
        <p>
          We ship via <strong className="text-[#F5F0E8]">Delhivery</strong>, one of India's most reliable logistics networks. Once your order is dispatched, you will receive a tracking link via email.
        </p>
      </Section>

      <Section title="Order Tracking">
        <p>
          After dispatch, a tracking ID will be shared with you via email. You can track your order directly on the{" "}
          <a href="https://www.delhivery.com/track/" target="_blank" rel="noopener noreferrer" className="text-[#C9A96E] gold-underline">
            Delhivery website
          </a>
          .
        </p>
      </Section>

      <Section title="Failed Delivery">
        <p>
          If a delivery attempt fails, Delhivery will retry once. If the second attempt also fails, the order will be returned to us. Please ensure your address and phone number are correct at checkout.
        </p>
      </Section>

      <Section title="Contact">
        <p>For any shipping related queries, reach us at:</p>
        <ul className="space-y-2 mt-2">
          {["+91 9810924300", "+91 8810607608", "+91 8920989377"].map((num) => (
            <li key={num} className="flex items-center gap-3">
              <span className="text-[#C9A96E]">—</span>
              <a href={`https://wa.me/91${num.replace(/\D/g, "")}`} className="text-[#C9A96E] gold-underline">{num}</a>
            </li>
          ))}
        </ul>
        <p className="mt-4">
          Or email us at{" "}
          <a href="mailto:crescent.looom@gmail.com" className="text-[#C9A96E] gold-underline">
            crescent.looom@gmail.com
          </a>
        </p>
      </Section>

      <div className="mt-16 pt-10 border-t border-[#C9A96E]/15 flex flex-wrap gap-6">
        <Link to="/shop" className="btn-gold">Continue Shopping</Link>
        <Link to="/returns" className="text-[11px] tracking-[0.3em] uppercase text-[#F5F0E8]/60 gold-underline self-center">Returns & Exchanges</Link>
      </div>
    </div>
  );
}
