/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep preview/test builds separate from an already-running development server.
  distDir: process.env.NEXT_OUTPUT_DIR || ".next",
};
export default nextConfig;
