/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['res.cloudinary.com', 'tacotribe.s3.ap-south-1.amazonaws.com', 'd19rxn9gjbwl25.cloudfront.net', 'ipfs.io'],
    },
    reactStrictMode: false,
}

module.exports = nextConfig
