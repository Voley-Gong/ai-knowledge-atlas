import type { NextConfig } from "next";
import { writeFileSync } from 'fs';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/ai-knowledge-atlas',
  images: {
    unoptimized: true,
  },
};

// After static export, create .nojekyll to prevent GitHub Pages Jekyll processing
// This is needed because _next directory and special chars in chunk names
// would be ignored or mishandled by Jekyll
if (process.env.NODE_ENV === 'production') {
  try {
    writeFileSync('out/.nojekyll', '');
    console.log('Created out/.nojekyll');
  } catch {}
}

export default nextConfig;
