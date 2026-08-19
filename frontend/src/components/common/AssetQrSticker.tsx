"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";

interface AssetQrStickerProps {
  asset: any;
  size?: "compact" | "standard" | "large";
  showBorder?: boolean;
  className?: string;
}

export default function AssetQrSticker({ 
  asset, 
  size = "compact",
  showBorder = true,
  className = "" 
}: AssetQrStickerProps) {
  const assetId = asset?.id || 1;
  const qrUrl = `https://simaya.yapi.web.id/guest-detail-asset/${assetId}`;
  
  const fullCode = asset?.full_code || collectFullCode(asset);

  if (size === "large") {
    // Exact match for filament/pages/assets/detail.blade.php
    return (
      <div 
        className={`bg-white text-black select-none print:break-inside-avoid ${showBorder ? "border-2 border-black" : ""} ${className}`}
        style={{
          display: "inline-block",
          padding: "14px 16px",
          borderRadius: "4px",
          backgroundColor: "#ffffff",
          color: "#000000"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
          <QRCodeSVG
            value={qrUrl}
            size={110}
            fgColor="#048025"
            bgColor="#ffffff"
            level="M"
            marginSize={0}
          />
          <img 
            src="/images/yapi.png" 
            alt="Logo YAPI" 
            style={{
              width: "95px",
              height: "95px",
              borderRadius: "50%",
              objectFit: "contain"
            }}
          />
        </div>
        <div 
          style={{
            marginTop: "10px",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.02em",
            textAlign: "center",
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            color: "#000000",
            wordBreak: "break-word"
          }}
        >
          {fullCode}
        </div>
      </div>
    );
  }

  // Exact 1:1 match for filament/pages/assets/index.blade.php (3.4cm x 2cm sticker)
  return (
    <div 
      className={`
        bg-white text-black select-none print:break-inside-avoid
        ${showBorder ? "border border-black" : ""} 
        ${className}
      `}
      style={{
        width: size === "compact" ? "3.4cm" : "3.8cm",
        height: size === "compact" ? "2.0cm" : "2.2cm",
        padding: "0.1cm",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-evenly",
        backgroundColor: "#ffffff",
        color: "#000000"
      }}
    >
      {/* Top Row: QR Code + Official YAPI Logo */}
      <div 
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-evenly",
          marginBottom: "0.08cm"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <QRCodeSVG
            value={qrUrl}
            size={size === "compact" ? 38 : 44}
            fgColor="#048025"
            bgColor="#ffffff"
            level="M"
            marginSize={0}
          />
        </div>

        <img 
          src="/images/yapi.png" 
          alt="Logo YAPI" 
          style={{
            width: size === "compact" ? "1.4cm" : "1.5cm",
            height: size === "compact" ? "1.4cm" : "1.5cm",
            marginLeft: "0.15cm",
            objectFit: "contain",
            borderRadius: "50%"
          }}
        />
      </div>

      {/* Bottom Full Asset Code - EXACT Filament Font & Alignment */}
      <div 
        style={{
          fontSize: "7px",
          textAlign: "center",
          lineHeight: "1.15",
          wordWrap: "break-word",
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontWeight: 700,
          color: "#000000",
          letterSpacing: "-0.1px",
          padding: "0 2px"
        }}
      >
        {fullCode}
      </div>
    </div>
  );
}

function collectFullCode(asset: any): string {
  const parts = [
    asset?.unit?.number ?? '--',
    asset?.aktiva?.code ?? '--',
    asset?.location?.number ?? '--',
    asset?.tool?.code_name ?? '--',
    asset?.category?.code ?? '--',
    asset?.year?.code ?? '--',
    asset?.entries_number ?? '--',
  ];
  return parts.join('/');
}
