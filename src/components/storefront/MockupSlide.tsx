"use client";

import React from "react";
import { Shirt, Sparkles, Compass, Eye, Shield, Laptop, Monitor } from "lucide-react";
import type { FloatBanner } from "@/lib/storefront/defaults";

export function MockupSlide({
  floatBanners = [],
}: {
  floatBanners?: FloatBanner[];
}) {
  // Use first 4 float banners or fallback mock preview thumbnails
  const thumbnails = floatBanners.slice(0, 4);

  return (
    <div className="relative w-full overflow-hidden rounded-[1.75rem] border border-zinc-800/80 bg-[#09080b] p-3 sm:p-5 text-zinc-300 font-sans shadow-2xl min-h-[380px] sm:min-h-[420px] lg:min-h-[460px] flex flex-col transition-all duration-300 select-none">
      {/* Ambient background glows for Slide 2 */}
      <div className="pointer-events-none absolute -left-12 -top-12 h-44 w-44 rounded-full bg-purple-600/10 blur-[60px]" />
      <div className="pointer-events-none absolute -right-12 -bottom-12 h-44 w-44 rounded-full bg-indigo-600/10 blur-[60px]" />

      {/* Mock Browser Header Bar */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-2 px-1 text-[10px] sm:text-xs text-zinc-500">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
        </div>
        <div className="flex items-center gap-1 bg-zinc-900/60 rounded-md px-4 py-0.5 border border-zinc-800/30 text-[9px] font-mono text-zinc-400">
          <Laptop className="h-2.5 w-2.5" />
          <span>kviboystore.dev</span>
        </div>
        <div className="flex items-center gap-1 opacity-60">
          <span className="h-1 w-3 bg-zinc-600 rounded" />
          <span className="h-1 w-2 bg-zinc-600 rounded" />
        </div>
      </div>

      {/* Main Mock Website Body */}
      <div className="relative flex-grow mt-3 rounded-xl border border-zinc-900/80 bg-zinc-950/40 p-3 sm:p-4 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">

        {/* Outline Giant KV Text in background on the left */}
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 text-[8rem] sm:text-[11rem] font-black leading-none pointer-events-none select-none tracking-tighter"
          style={{
            WebkitTextStroke: "1px rgba(168, 85, 247, 0.06)",
            color: "transparent"
          }}
        >
          KV
        </div>

        {/* Top-left Brand Logo on the Mock Web */}
        <div className="absolute top-3 left-4 flex items-center gap-1">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-purple-500 to-indigo-600 text-[10px] font-black text-white shadow-sm shadow-purple-500/20">
            K
          </span>
          <span className="text-[11px] font-bold text-white tracking-tight">Kviboystore</span>
        </div>

        {/* Central Focus: Product Screenshot Placeholder (Hoodie) */}
        <div className="lg:col-span-6 xl:col-span-7 mt-8 lg:mt-6 flex flex-col justify-center">
          <div className="group relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-950/20 to-zinc-950 shadow-[0_0_20px_rgba(168,85,247,0.05),inset_0_1px_1px_rgba(255,255,255,0.02)] overflow-hidden flex flex-col items-center justify-center p-4">

            {/* Glossy sheen overlay */}
            <span className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] via-white/[0.04] to-transparent pointer-events-none" />

            {/* Techwear Graphic Mock */}
            <div className="relative flex items-center justify-center h-20 w-20 sm:h-28 sm:w-28 rounded-2xl bg-purple-500/10 border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all group-hover:scale-105 duration-500">
              <Shirt className="h-10 w-10 sm:h-14 sm:w-14 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
              <Sparkles className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 text-purple-300 animate-pulse" />
              <div className="absolute inset-x-0 bottom-1 flex justify-center">
                <span className="text-[8px] font-mono tracking-widest text-purple-300/80 bg-purple-950/60 px-1 rounded uppercase">Techwear</span>
              </div>
            </div>

            {/* Visual Indicators */}
            <div className="mt-3.5 flex flex-col items-center text-center">
              <span className="text-[10px] sm:text-xs font-bold text-white tracking-tight flex items-center gap-1">
                Glossy Purple Techwear Hoodie
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              </span>
              <p className="mt-1 text-[8px] sm:text-[9px] text-zinc-500 font-mono tracking-wide">
                [ Screenshot Placeholder: Hoodie.png ]
              </p>
            </div>

            {/* Layout template tags */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[8px] font-mono text-purple-400 bg-purple-950/45 border border-purple-800/30 px-1.5 py-0.5 rounded">
              <div className="h-1 w-1 rounded-full bg-purple-400 animate-ping" />
              <span>PRIMARY FOCUS</span>
            </div>
          </div>
        </div>

        {/* Right Side: Frosted Glass Panel with Description, CTA, and Thumbnail Grid */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between mt-2 lg:mt-6">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-3 sm:p-4 shadow-lg flex flex-col gap-3 h-full">

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest bg-purple-950/50 border border-purple-900/30 px-1.5 py-0.5 rounded-md">
                  CMS-Editable
                </span>
                <span className="h-1 w-1 rounded-full bg-zinc-600" />
                <span className="text-[9px] text-zinc-400 font-mono">Panel v2.4</span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight mt-1.5">
                Kviboystore
              </h3>
              <p className="mt-1 text-[9px] sm:text-[10px] text-zinc-400 leading-relaxed line-clamp-2">
                Template workspace kreatif termodulasi. Admin dapat memperbarui tata letak, aset gambar, dan deskripsi produk secara real-time dari dashboard CMS.
              </p>
            </div>

            {/* Grid of 4 Smaller Preview Thumbnails (Admin-editable placeholders) */}
            <div>
              <div className="flex items-center justify-between mb-1.5 text-[9px] font-semibold text-zinc-400">
                <span>PREVIEW THUMBNAILS (SLOT 1-4)</span>
                <span className="text-purple-400/90 font-mono">4 Slots</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {Array.from({ length: 4 }).map((_, idx) => {
                  const banner = thumbnails[idx];
                  return (
                    <div
                      key={idx}
                      className="group/thumb aspect-square rounded-md border border-zinc-800/80 bg-zinc-900/40 hover:border-purple-500/30 hover:bg-purple-950/10 transition-colors p-1 flex flex-col items-center justify-center relative overflow-hidden"
                    >
                      {banner && banner.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={banner.imageUrl}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover opacity-60 group-hover/thumb:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-0.5 text-zinc-600 group-hover/thumb:text-purple-400 transition-colors">
                          <Eye className="h-3.5 w-3.5 shrink-0" />
                          <span className="text-[7px] font-mono leading-none">S{idx + 1}</span>
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-black/70 text-[6px] text-center font-mono py-0.5 truncate text-white/90">
                        {banner ? banner.title.slice(0, 7) : `Slot ${idx + 1}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA Discover Button */}
            <div className="mt-1 flex items-center justify-between gap-3">
              <span className="text-[8px] text-zinc-500 font-mono italic">
                Interactive Grid
              </span>
              <button
                type="button"
                className="rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] sm:text-xs py-1.5 px-4 transition-all shadow-md shadow-purple-500/20 flex items-center gap-1 active:scale-95 cursor-pointer"
              >
                <Compass className="h-3 w-3 shrink-0" />
                Discover
              </button>
            </div>

          </div>
        </div>

        {/* Bottom: Horizontal Promo Banner with Screenshot Placeholder */}
        <div className="col-span-full mt-1.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 p-2 rounded-lg border border-purple-500/10 bg-purple-950/5 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Shield className="h-3 w-3" />
            </span>
            <div>
              <p className="text-[9px] sm:text-[10px] font-bold text-white leading-none">
                Additional Promo & Safety Escrow Banner
              </p>
              <p className="mt-0.5 text-[8px] text-zinc-500 leading-none">
                Secured platform-owned transaction system with payment gateways
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <div className="w-full sm:w-[130px] h-6 rounded border border-zinc-800/80 bg-zinc-900/60 flex items-center justify-center text-[7px] sm:text-[8px] font-mono text-zinc-500">
              [ banner_screenshot.png ]
            </div>
            <div className="h-1.5 w-1.5 rounded-full bg-purple-500/60 animate-ping hidden sm:block" />
          </div>
        </div>

      </div>
    </div>
  );
}
