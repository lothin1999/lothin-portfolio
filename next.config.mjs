/** @type {import('next').NextConfig} */

// Guard against Node.js 23 internal TransformStream race conditions on closed client connections
if (typeof process !== "undefined") {
  process.on("unhandledRejection", (reason) => {
    if (reason && typeof reason === "object" && "message" in reason) {
      const msg = String(reason.message);
      if (msg.includes("transformAlgorithm") || msg.includes("kState")) {
        return;
      }
    }
  });
}

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "**.ibb.co" },
      { protocol: "https", hostname: "imagedelivery.net" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};
export default nextConfig;
