import React, { useState } from "react";
import { Link } from "react-router-dom";
import { RotateCcw, Repeat, Wallet, ShieldCheck, MessageCircle, Camera, Clock, PackageCheck, ChevronDown, X, Check } from "lucide-react";

const HERO_IMG = "https://customer-assets.emergentagent.com/job_artisan-crescent/artifacts/dp4xzzoz_plain%20black%201%20.png";

const STEPS = [
  { Icon: MessageCircle, title: "WhatsApp Us", body: "Message us with your Order ID and reason for return." },
  { Icon: Camera, title: "Share Photos", body: "Attach clear photos of the item showing the issue." },
  { Icon: Clock, title: "We Review", body: "Our team responds within 24–48 hours with next steps." },
  { Icon: PackageCheck, title: "Ship It Back", body: "Once approved, send the item to us via trackable courier." },
  { Icon: RotateCcw, title: "Credit or Exchange", body: "We verify the item and issue store credit or dispatch your exchange." },
];

const FAQS = [
  { q: "How many days do I have to return a product?", a: "You have 7 days from the date of delivery to raise a return or exchange request." },
  { q: "Do I get a cash refund?", a: "We primarily issue store credit as Loom Credits or a size exchange. In select cases, a refund to your original payment method or UPI/bank account may be issued at our discretion — just raise it with us on WhatsApp and we'll let you know what applies to your order." },
  { q: "Is return shipping free?", a: "No, return shipping is currently borne by the customer. We recommend using a trackable courier service." },
  { q: "Can I return for a different size instead?", a: "Yes, size exchanges are available for eligible items — just mention this when you message us." },
  { q: "What if I receive a wrong or defective product?", a: "We accept these cases without question — message us with photos and we'll make it right." },
  { q: "How do I track my return status?", a: "We'll keep you updated directly over WhatsApp throughout the process." },
];

function FaqItem({ q, a, open, onClick }) {
  return (
    <div className="border-t" style={{ borderColor: "var(--cl-border)" }}>
      <button onClick={onClick} className="w-full flex items-center justify-between py-5 text-left">
        <span className="text-sm md:text-base pr-4" style={{ color: "var(--cl-text)" }}>{q}</span>
        <ChevronDown size={16} style={{ color: "#B8C0C8", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s ease", flexShrink: 0 }} />
      </button>
      {open && <p className="pb-5 text-sm leading-relaxed" style={{ color: "var(--cl-subtext)" }}>{a}</p>}
    </div>
  );
}

export default function ReturnPolicyPage() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="page-fade pt-28 md:pt-32 pb-24">
      <div className="max-w-none mx-auto px-6 md:px-12">
        <div className="text-[11px] tracking-[0.3em] uppercase mb-8" style={{ color: "var(--cl-subtext)" }}>
          <Link to="/" className="hover:text-[#B8C0C8]">Home</Link> <span className="mx-2">/</span>
          <span style={{ color: "var(--cl-text)", opacity: 0.85 }}>Returns & Exchanges</span>
        </div>

        {/* Hero */}
        <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
          <div>
            <h1 className="font-serif-display text-5xl md:text-6xl leading-[0.95]" style={{ color: "var(--cl-text)" }}>
              Returns &amp; <span className="italic" style={{ color: "var(--cl-text)" }}>Exchange Policy</span>
            </h1>
            <p className="mt-5 text-sm" style={{ color: "var(--cl-subtext)" }}>
              We make few things, but we make them carefully. Simple · Transparent · Hassle-Free.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
            <img src={HERO_IMG} alt="" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Promise badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {[
            ["7 Days", "Easy Returns"],
            ["Size", "Exchange Available"],
            ["Store Credit", "Loom Credits Issued"],
            ["100%", "Original Products"],
          ].map(([big, small]) => (
            <div key={small} className="border p-4 text-center" style={{ borderColor: "var(--cl-border)" }}>
              <div className="font-serif-display text-xl" style={{ color: "var(--cl-text)" }}>{big}</div>
              <div className="text-[10px] tracking-[0.15em] uppercase mt-1" style={{ color: "var(--cl-subtext)" }}>{small}</div>
            </div>
          ))}
        </div>

        {/* Our Promise */}
        <div className="mb-20">
          <h2 className="font-serif-display text-3xl mb-8" style={{ color: "var(--cl-text)" }}>Our Promise</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              [RotateCcw, "Returns", "Not satisfied? Return it within 7 days of delivery."],
              [Repeat, "Exchanges", "Need a different size or color, subject to availability."],
              [Wallet, "Store Credit", "Get Loom Credits once we receive and verify the item."],
            ].map(([Icon, title, body]) => (
              <div key={title} className="border p-6" style={{ borderColor: "var(--cl-border)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ background: "var(--cl-surface)" }}>
                  <Icon size={16} style={{ color: "#B8C0C8" }} />
                </div>
                <div className="font-serif-display text-xl mb-2" style={{ color: "var(--cl-text)" }}>{title}</div>
                <p className="text-sm" style={{ color: "var(--cl-subtext)" }}>{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How to raise */}
        <div className="mb-20">
          <h2 className="font-serif-display text-3xl mb-8" style={{ color: "var(--cl-text)" }}>How to raise a return / exchange</h2>
          <div className="grid md:grid-cols-5 gap-4">
            {STEPS.map((s, i) => (
              <div key={s.title} className="border p-5" style={{ borderColor: "var(--cl-border)" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center mb-4 text-xs" style={{ background: "var(--cl-surface)", color: "var(--cl-text)" }}>
                 {String(i + 1).padStart(2, "0")}
                </div>
                <s.Icon size={18} style={{ color: "#B8C0C8" }} className="mb-3" />
                <div className="text-sm font-medium mb-1.5" style={{ color: "var(--cl-text)" }}>{s.title}</div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--cl-subtext)" }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Eligibility vs Non-returnable */}
        <div className="grid md:grid-cols-2 gap-5 mb-20">
          <div className="border p-6" style={{ borderColor: "rgba(143,188,143,0.3)", background: "var(--cl-surface)" }}>
            <div className="text-[11px] tracking-[0.3em] uppercase mb-4" style={{ color: "#8FBC8F" }}>Return / Exchange Eligibility</div>
            <ul className="space-y-3 text-sm">
              {["Product must be unused, unwashed and in original condition", "All tags and packaging must be intact", "Return or exchange request must be raised within 7 days of delivery", "Products bought during special sales may be subject to different terms"].map((item) => (
                <li key={item} className="flex items-start gap-2" style={{ color: "var(--cl-text)", opacity: 0.85 }}>
                  <Check size={14} style={{ color: "#8FBC8F" }} className="mt-0.5 shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="border p-6" style={{ borderColor: "rgba(229,115,115,0.3)", background: "var(--cl-surface)" }}>
            <div className="text-[11px] tracking-[0.3em] uppercase mb-4" style={{ color: "#E57373" }}>Non-Returnable Cases</div>
            <ul className="space-y-3 text-sm">
              {["Change of mind after purchase", "Incorrect size selected (please check our size guide first)", "Items washed, worn, or damaged by the customer", "Items without original tags or packaging"].map((item) => (
                <li key={item} className="flex items-start gap-2" style={{ color: "var(--cl-text)", opacity: 0.85 }}>
                  <X size={14} style={{ color: "#E57373" }} className="mt-0.5 shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-20">
          <h2 className="font-serif-display text-3xl mb-4" style={{ color: "var(--cl-text)" }}>Frequently Asked Questions</h2>
          <div>
            {FAQS.map((f, i) => (
              <FaqItem key={f.q} q={f.q} a={f.a} open={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </div>

        {/* Still need help */}
        <div className="border p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-16" style={{ borderColor: "rgba(184,192,200,0.25)", background: "var(--cl-surface)" }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={16} style={{ color: "#B8C0C8" }} />
              <span className="font-serif-display text-xl" style={{ color: "var(--cl-text)" }}>Still need help?</span>
            </div>
            <p className="text-sm" style={{ color: "var(--cl-subtext)" }}>Our team typically responds within 24–48 hours.</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="mailto:crescent.looom@gmail.com" className="text-[11px] tracking-[0.25em] uppercase border px-5 py-3" style={{ borderColor: "var(--cl-border)", color: "var(--cl-text)" }}>Email Us</a>
            <a href="https://wa.me/919810924300" target="_blank" rel="noopener noreferrer" className="btn-gold">Message on WhatsApp</a>
          </div>
        </div>

        <div className="pt-10 border-t flex flex-wrap gap-6" style={{ borderColor: "rgba(184,192,200,0.15)" }}>
          <Link to="/shop" className="btn-gold">Continue Shopping</Link>
          <Link to="/account" className="text-[11px] tracking-[0.3em] uppercase gold-underline self-center" style={{ color: "var(--cl-text)", opacity: 0.7 }}>My Orders</Link>
        </div>
      </div>
    </div>
  );
}
