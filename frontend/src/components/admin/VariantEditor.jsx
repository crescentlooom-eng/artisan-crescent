import React, { useState, useRef } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Upload, X, Plus, Loader2 } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function VariantImageUploader({ images, onChange, variantName }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const next = [...images];
    for (const file of Array.from(files)) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        const r = await api.post("/admin/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        // Store the absolute URL so frontend img src works directly
        next.push(`${BACKEND_URL}${r.data.url}`);
      } catch (e) {
        toast.error(`Failed to upload ${file.name}: ${e?.response?.data?.detail || e.message}`);
      }
    }
    onChange(next);
    setUploading(false);
    toast.success("Images uploaded");
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((img, i) => (
          <div key={i} className="relative w-20 h-24 group">
            <img src={img} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, j) => j !== i))}
              className="absolute -top-2 -right-2 bg-[#0B0E1A] border border-[#C9A96E]/40 text-[#C9A96E] rounded-full w-5 h-5 text-xs flex items-center justify-center"
              data-testid={`variant-img-remove-${i}`}
            >×</button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-20 h-24 border border-dashed border-[#C9A96E]/40 hover:border-[#C9A96E] text-[#C9A96E] text-xs flex flex-col items-center justify-center gap-1 disabled:opacity-50"
          data-testid={`variant-img-upload-${variantName}`}
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <><Upload size={14} /><span>Upload</span></>}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

export default function VariantEditor({ variants, onChange }) {
  const update = (i, patch) => {
    const next = [...variants];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const remove = (i) => onChange(variants.filter((_, j) => j !== i));
  const add = () => onChange([...variants, { id: `v_${Math.random().toString(36).slice(2,10)}`, name: `Variant ${variants.length+1}`, color_hex: "", images: [] }]);

  return (
    <div className="border border-[#C9A96E]/15 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E]">Variants ({variants.length})</div>
        <button type="button" onClick={add} className="text-[11px] tracking-[0.3em] uppercase gold-underline text-[#F5F0E8]/80 flex items-center gap-2" data-testid="variant-add">
          <Plus size={14} /> Add Variant
        </button>
      </div>
      <div className="space-y-6">
        {variants.map((v, i) => (
          <div key={v.id || i} className="border border-[#C9A96E]/10 p-4" data-testid={`variant-row-${i}`}>
            <div className="grid grid-cols-12 gap-3 items-end mb-3">
              <div className="col-span-6">
                <label className="text-[10px] tracking-[0.3em] uppercase text-[#8A8FA8]">Variant Name</label>
                <input value={v.name} onChange={(e) => update(i, { name: e.target.value })} data-testid={`variant-name-${i}`} />
              </div>
              <div className="col-span-4">
                <label className="text-[10px] tracking-[0.3em] uppercase text-[#8A8FA8]">Color Hex (optional)</label>
                <input value={v.color_hex || ""} placeholder="#0B0E1A" onChange={(e) => update(i, { color_hex: e.target.value })} />
              </div>
              <div className="col-span-2 flex justify-end">
                <button type="button" onClick={() => remove(i)} className="text-[#8A8FA8] hover:text-[#C9A96E]" data-testid={`variant-remove-${i}`}>
                  <X size={16} />
                </button>
              </div>
            </div>
            <VariantImageUploader
              images={v.images || []}
              onChange={(imgs) => update(i, { images: imgs })}
              variantName={v.name?.toLowerCase().replace(/\s+/g, "-") || i}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
