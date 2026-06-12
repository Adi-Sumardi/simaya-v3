import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SIMAYA Asset Management",
    short_name: "SIMAYA",
    description: "Sistem Informasi Manajemen Aset Yayasan Terintegrasi",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFBF7",
    theme_color: "#F27A38",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
