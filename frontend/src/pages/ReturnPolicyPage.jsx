import React from "react";
import { Link } from "react-router-dom";

const Section = ({ title, children }) => (
  <div className="border-t border-[#C9A96E]/15 pt-10 mt-10">
    <div className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E] mb-4">{title}</div>
    <div className="text-[#F5F0E8]/80 leading-relaxed space-y-4 text-sm md:text-base">{children}</div>
  </div>
);

export default function ReturnPolicyPage() {
  return (
    <div className="page-fade pt-32 pb-24 max-w-3xl mx-auto px-6 md:px-12">
      <div className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E] mb-4">Policies</div>
      <h1 className="font-serif-display text-5xl md:text-6xl text-[#F5F0E8] leading-[0.95]">
        Returns &amp; <span className="italic text-[#C9A96E]/90">Exchanges</span>
      </h1>
      <p className="text-[#F5F0E8]/60 mt-6 text-sm leading-relaxed max-w-xl">
        We make few things, but we make them carefully. If something isn't right, we'll make it right.
      </p>

      <Section title="Return Window">
        <p>
          We accept return and exchange requests within <strong className="text-[#F5F0E8]">7 days</strong> of delivery. Requests raised after 7 days will not be accepted.
        </p>
        <p>
          To be eligible, items must be unworn, unwashed, and in their original condition with all tags intact.
        </p>
      </Section>

      <Section title="What We Accept">
        <p>We accept returns or exchanges only in the following cases:</p>
        <ul className="space-y-2 mt-2">
          {[
            "Wrong item delivered",
            "Defective or damaged product",
            "Wrong size delivered (different from what was ordered)",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="text-[#C9A96E] mt-1">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[#F5F0E8]/50 text-xs tracking-wide">
          We do not accept returns for change of mind or incorrect size selection. Please refer to our size guide before ordering.
        </p>
      </Section>

      <Section title="Exchange or Store Credit">
        <p>
          We offer <strong className="text-[#F5F0E8]">size exchanges</strong> and <strong className="text-[#F5F0E8]">store credit</strong> for eligible returns. Cash refunds are not available at this time.
        </p>
        <p>
          Store credit is issued as <strong className="text-[#F5F0E8]">Loom Credits</strong> to your account and can be used on your next order.
        </p>
      </Section>

      <Section title="Return Shipping">
        <p>
          Return shipping charges are to be borne by the customer. We recommend using a trackable courier service. Crescent Loom is not responsible for items lost in transit during return.
        </p>
      </Section>

      <Section title="How to Initiate a Return">
        <p>To raise a return or exchange request:</p>
        <ul className="space-y-3 mt-2">
          {[
            "WhatsApp us at the number given below with your Order ID and reason",
            "Attach clear photos of the item showing the issue",
            "Our team will respond within 24–48 hours",
            "Once approved, ship the item to the address provided",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-[#C9A96E] font-serif-display text-lg leading-none mt-0.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Contact">
        <p>
          For any queries regarding returns, write to us at{" "}
          <a href="mailto:crescent.looom@gmail.com" className="text-[#C9A96E] gold-underline">
            crescent.looom@gmail.com
          </a>
        </p>
        <p>Or WhatsApp us at:</p>
        <ul className="space-y-2 mt-2">
          {["+91 9810924300", "+91 8810607608", "+91 8920989377"].map((num) => (
            <li key={num} className="flex items-center gap-3">
              <span className="text-[#C9A96E]">—</span>
              <a href={`https://wa.me/91${num.replace(/\D/g,"")}`} className="text-[#C9A96E] gold-underline">{num}</a>
            </li>
          ))}
        </ul>
      </Section>

      <div className="mt-16 pt-10 border-t border-[#C9A96E]/15 flex flex-wrap gap-6">
        <Link to="/shop" className="btn-gold">Continue Shopping</Link>
        <Link to="/account" className="text-[11px] tracking-[0.3em] uppercase text-[#F5F0E8]/60 gold-underline self-center">My Orders</Link>
      </div>
    </div>
  );
}

