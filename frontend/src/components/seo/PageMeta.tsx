import { FC } from 'react';
import { Helmet } from 'react-helmet-async';

type JsonLdObject = Record<string, unknown>;

interface PageMetaProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  twitterCard?: 'summary' | 'summary_large_image';
  noindex?: boolean;
  jsonLd?: JsonLdObject;
}

const APP_NAME = 'Nexus';

const PageMeta: FC<PageMetaProps> = ({
  title,
  description,
  image,
  url,
  type = 'website',
  twitterCard = 'summary_large_image',
  noindex = false,
  jsonLd,
}) => {
  const fullTitle = title.includes(APP_NAME) ? title : `${title} | ${APP_NAME}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex ? <meta name="robots" content="noindex, nofollow" /> : null}

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {image ? <meta property="og:image" content={image} /> : null}
      {url ? <meta property="og:url" content={url} /> : null}

      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image ? <meta name="twitter:image" content={image} /> : null}

      {url ? <link rel="canonical" href={url} /> : null}
      {jsonLd ? (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      ) : null}
    </Helmet>
  );
};

export default PageMeta;
