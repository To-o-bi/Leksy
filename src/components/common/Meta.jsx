import React from 'react';
import { Helmet } from 'react-helmet-async';

const Meta = ({ title, description, keywords, image, url }) => {
  // Default values
  const defaultTitle = 'Leksy Cosmetics - Premium Skincare & Beauty';
  const defaultDescription = 'Discover high-quality skincare, cosmetics, and beauty products designed to make you shine. Shop the best for your skin at Leksy Cosmetics.';
  const siteUrl = 'https://www.leksycosmetics.com'; // Replace with your actual domain
  const defaultImage = `${siteUrl}/public/assets/images/leksy-og-image.png`; // Replace with a link to your default sharing image

  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalImage = image || defaultImage;
  const canonicalUrl = `${siteUrl}${url || ''}`;

  return (
    <Helmet>
      {/* --- Primary Meta Tags --- */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={keywords || 'skincare, cosmetics, beauty, makeup, leksy'} />
      <link rel="canonical" href={canonicalUrl} />

      {/* --- Open Graph / Facebook / Instagram / Snapchat --- */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:site_name" content="Leksy Cosmetics" />

      {/* --- Twitter Card Tags --- */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
    </Helmet>
  );
};

export default Meta;

