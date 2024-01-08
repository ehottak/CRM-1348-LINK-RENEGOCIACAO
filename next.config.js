const isProd = process.env.NODE_ENV === 'production'
const nextConfig = {
    env: {
        NEXT_VERSION: process.env.npm_package_version,
        NEXT_BASE : 'PRODUCTION'
    },
    poweredByHeader: false,
    reactStrictMode: false,
    assetPrefix: isProd ?  process.env.NEXT_BASEPATH_CDL: undefined,
    basePath:  process.env.NEXT_BASEPATH_CDL
};

module.exports = nextConfig;
