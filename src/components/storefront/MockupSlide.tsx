"use client";

import React from "react";
import { Shirt, Sparkles, Compass, Eye, Shield, Laptop } from "lucide-react";
import type { FloatBanner } from "@/lib/storefront/defaults";

export function MockupSlide({
  floatBanners = [],
}: {
  floatBanners?: FloatBanner[];
}) {
  // Use first 4 float banners or fallback mock preview thumbnails
  const thumbnails = floatBanners.slice(0, 4);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-purple-500/15 bg-zinc-950/45 p-2 sm:p-3 text-zinc-300 font-sans shadow-2xl min-h-[460px] sm:min-h-[350px] md:min-h-[285px] flex flex-col transition-all duration-300 select-none backdrop-blur-md">
      {/* Ambient background glows for Slide 2 */}
      <div className="pointer-events-none absolute -left-12 -top-12 h-32 w-32 rounded-full bg-purple-600/10 blur-[40px]" />
      <div className="pointer-events-none absolute -right-12 -bottom-12 h-32 w-32 rounded-full bg-indigo-600/10 blur-[40px]" />

      {/* Mock Browser Header Bar (Compact) */}
      <div className="flex items-center justify-between border-b border-zinc-900/60 pb-1.5 px-1 text-[9px] text-zinc-500">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500/50" />
          <span className="h-2 w-2 rounded-full bg-yellow-500/50" />
          <span className="h-2 w-2 rounded-full bg-green-500/50" />
        </div>
        <div className="flex items-center gap-1 bg-zinc-900/40 rounded px-2.5 py-0.5 border border-zinc-800/20 text-[8px] font-mono text-zinc-400">
          <Laptop className="h-2 w-2" />
          <span>kviboystore.dev</span>
        </div>
        <div className="w-6" /> {/* Spacer */}
      </div>

      {/* Main Mock Website Body */}
      <div className="relative flex-grow mt-2 rounded-xl bg-zinc-950/30 p-2.5 overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-3">

        {/* Outline Giant KV Text in background on the left */}
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 text-[7rem] sm:text-[9rem] font-black leading-none pointer-events-none select-none tracking-tighter"
          style={{
            WebkitTextStroke: "1px rgba(168, 85, 247, 0.05)",
            color: "transparent"
          }}
        >
          KV
        </div>

        {/* Top-left Brand Logo on the Mock Web */}
        <div className="absolute top-2 left-3.5 flex items-center gap-1 z-10">
          <span className="flex h-4 w-4 items-center justify-center rounded bg-gradient-to-br from-purple-500 to-indigo-600 text-[8px] font-black text-white shadow-sm shadow-purple-500/20">
            K
          </span>
          <span className="text-[10px] font-bold text-white tracking-tight">Kviboystore</span>
        </div>

        {/* Central Focus: Product Screenshot Placeholder (Techwear Hoodie) */}
        <div className="md:col-span-6 mt-6 md:mt-4 flex flex-col justify-center">
          <div className="group relative w-full aspect-[16/9] rounded-lg border border-purple-500/15 bg-gradient-to-br from-purple-950/15 to-zinc-950 shadow-[0_0_15px_rgba(168,85,247,0.03),inset_0_1px_1px_rgba(255,255,255,0.01)] overflow-hidden flex flex-col items-center justify-center p-2">

            {/* Glossy sheen overlay */}
            <span className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] via-white/[0.03] to-transparent pointer-events-none" />

            {/* Techwear Graphic Mock */}
            <div className="relative flex items-center justify-center h-14 w-14 sm:h-18 sm:w-18 rounded-xl bg-purple-500/10 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all group-hover:scale-105 duration-500">
              <Shirt className="h-7 w-7 sm:h-9 sm:w-9 text-purple-450 drop-shadow-[0_0_5px_rgba(168,85,247,0.4)]" />
              <div className="absolute inset-x-0 bottom-0.5 flex justify-center">
                <span className="text-[6px] font-mono tracking-wider text-purple-300/80 bg-purple-950/60 px-1 rounded uppercase">Techwear</span>
              </div>
            </div>

            {/* Visual Indicators */}
            <div className="mt-2 flex flex-col items-center text-center">
              <span className="text-[9px] font-bold text-white tracking-tight flex items-center gap-1">
                Glossy Purple Techwear Hoodie
                <span className="h-1 w-1 rounded-full bg-purple-500" />
              </span>
              <p className="mt-0.5 text-[7px] text-zinc-600 font-mono tracking-wide">
                [ Placeholder: Hoodie.png ]
              </p>
            </div>

            {/* Layout template tags */}
            <div className="absolute top-2 right-2 flex items-center gap-1 text-[7px] font-mono text-purple-400 bg-purple-950/40 border border-purple-800/30 px-1 rounded">
              <div className="h-1 w-1 rounded-full bg-purple-400 animate-ping" />
              <span>FOCUS</span>
            </div>
          </div>
        </div>

        {/* Right Side: Frosted Glass Panel with Description, CTA, and Thumbnail Grid */}
        <div className="md:col-span-6 flex flex-col justify-between mt-1.5 md:mt-4">
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5 shadow-md flex flex-col gap-2.5 h-full">

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-bold text-purple-400 uppercase tracking-widest bg-purple-950/40 border border-purple-900/20 px-1 py-0.5 rounded">
                  CMS-Editable
                </span>
                <span className="h-1 w-1 rounded-full bg-zinc-700" />
                <span className="text-[8px] text-zinc-500 font-mono">Panel v2.4</span>
              </div>
              <h3 className="text-xs font-bold text-white tracking-tight mt-1">
                Kviboystore
              </h3>
              <p className="mt-0.5 text-[9px] text-zinc-400 leading-normal line-clamp-2">
                Workspace kreatif termodulasi. Tata letak, aset gambar, dan deskripsi produk diubah dari dashboard CMS.
              </p>
            </div>

            {/* Grid of 4 Smaller Preview Thumbnails */}
            <div>
              <div className="flex items-center justify-between mb-1 text-[8px] font-semibold text-zinc-400">
                <span>PREVIEW THUMBNAILS (SLOT 1-4)</span>
                <span className="text-purple-400/80 font-mono">4 Slots</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {Array.from({ length: 4 }).map((_, idx) => {
                  const banner = thumbnails[idx];
                  return (
                    <div
                      key={idx}
                      className="group/thumb aspect-square rounded border border-zinc-800/60 bg-zinc-900/30 hover:border-purple-500/20 hover:bg-purple-950/10 transition-colors p-0.5 flex flex-col items-center justify-center relative overflow-hidden"
                    >
                      {banner && banner.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={banner.imageUrl}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover opacity-60 group-hover/thumb:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-zinc-650 group-hover/thumb:text-purple-400 transition-colors">
                          <Eye className="h-3 w-3 shrink-0" />
                          <span className="text-[6px] font-mono leading-none">S{idx + 1}</span>
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-black/80 text-[5px] text-center font-mono py-0.5 truncate text-white/95 leading-none">
                        {banner ? banner.title.slice(0, 7) : `Slot ${idx + 1}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA Discover Button */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[7px] text-zinc-600 font-mono">
                Interactive Grid
              </span>
              <button
                type="button"
                className="rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-[9px] py-1 px-3.5 transition-all shadow-md shadow-purple-500/25 flex items-center gap-1 active:scale-95 cursor-pointer"
              >
                <Compass className="h-2.5 w-2.5 shrink-0" />
                Discover
              </button>
            </div>

          </div>
        </div>

        {/* Bottom: Horizontal Promo Banner with Screenshot Placeholder */}
        <div className="col-span-full mt-1 flex flex-col sm:flex-row items-center justify-between gap-2 p-1.5 rounded-lg border border-purple-500/10 bg-purple-950/5 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-1.5">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Shield className="h-2.5 w-2.5" />
            </span>
            <div>
              <p className="text-[8px] sm:text-[9px] font-bold text-white leading-none">
                Additional Promo & Escrow Banner
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-[110px] h-4.5 rounded border border-zinc-800 bg-zinc-900/60 flex items-center justify-center text-[6px] font-mono text-zinc-600">
              [ banner_screenshot.png ]
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
