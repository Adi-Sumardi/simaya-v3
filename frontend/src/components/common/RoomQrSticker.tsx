"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";

interface RoomQrStickerProps {
  location: any;
  size?: "standard" | "large";
  className?: string;
}

export default function RoomQrSticker({ 
  location, 
  size = "standard",
  className = "" 
}: RoomQrStickerProps) {
  const locId = location?.id || 1;
  const qrUrl = `https://simaya.yapi.web.id/guest-data-asset-ruangan/${locId}`;
  
  return (
    <div 
      className={`
        bg-white text-black border-2 border-black rounded-lg p-3 select-none print:break-inside-avoid shadow-sm
        flex flex-col items-center justify-between text-center
        ${className}
      `}
      style={{
        width: size === "large" ? "6.5cm" : "5.2cm",
        minHeight: size === "large" ? "4.5cm" : "3.6cm",
        backgroundColor: "#ffffff",
        color: "#000000"
      }}
    >
      {/* Header text */}
      <div className="text-[9px] font-extrabold uppercase tracking-wider text-black border-b border-black/20 pb-1 w-full text-center">
        Inventaris Ruangan &bull; YAPI
      </div>

      {/* Center QR + Logo */}
      <div className="flex items-center justify-center gap-3 my-2">
        <QRCodeSVG
          value={qrUrl}
          size={size === "large" ? 80 : 65}
          fgColor="#048025"
          bgColor="#ffffff"
          level="M"
          marginSize={0}
        />
        <img 
          src="/images/yapi.png" 
          alt="Logo YAPI" 
          style={{
            width: size === "large" ? "1.8cm" : "1.4cm",
            height: size === "large" ? "1.8cm" : "1.4cm",
            objectFit: "contain",
            borderRadius: "50%"
          }}
        />
      </div>

      {/* Room identity footer */}
      <div className="w-full flex flex-col items-center">
        <span className="font-extrabold font-serif text-xs sm:text-sm text-black leading-tight">
          {location?.name || "Ruangan"}
        </span>
        <span className="font-mono text-[9px] font-bold text-black/70 mt-0.5">
          KODE: {location?.number || "--"} &bull; {location?.floor || "Lantai 1"}
        </span>
      </div>
    </div>
  );
}
