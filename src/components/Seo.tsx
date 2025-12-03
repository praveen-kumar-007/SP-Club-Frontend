import React from "react";
import { Helmet } from "react-helmet-async";

type SeoProps = {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  keywords?: string;
  canonical?: string;
};

const SITE_NAME = "SP Club";
const SITE_URL = "https://spkabaddi.me";
const DEFAULT_IMAGE = `${SITE_URL}/Logo.png`;
const DEFAULT_DESCRIPTION =
  "SP Club (SP Kabaddi Group Dhanbad) — premier sports club in Dhanbad offering coaching, events, and championship training.";

const Seo: React.FC<SeoProps> = ({
  title,
  description,
  url,
  image,
  keywords,
  canonical,
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Premier Sports Club`;
  const metaUrl = url || SITE_URL;
  const metaImage = image || DEFAULT_IMAGE;
  const metaDescription = description || DEFAULT_DESCRIPTION;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonical || metaUrl} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:image" content={metaImage} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* Basic mobile/favicons */}
      <meta name="theme-color" content="#0f172a" />
    </Helmet>
  );
};

export default Seo;
