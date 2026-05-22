import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  canonical?: string
  image?: string
  type?: 'website' | 'article' | 'recipe'
}

const SEO = ({
  title = 'pp.health — Здоровое питание',
  description = 'Рецепты, статьи и планы меню для здорового питания. Найдите свой идеальный рацион.',
  canonical,
  image = 'http://localhost:5173/og-image.jpg',
  type = 'website',
}: SEOProps) => {
  const fullTitle = title === 'pp.health — Здоровое питание'
    ? title
    : `${title} | pp.health`

  const url = canonical || (typeof window !== 'undefined' ? window.location.href : '')

  return (
    <Helmet>
      {/* Базовые мета-теги */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Canonical URL — исключаем дубли контента */}
      <link rel="canonical" href={url} />

      {/* Open Graph — для предпросмотра в соцсетях */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="pp.health" />
      <meta property="og:locale" content="ru_RU" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  )
}

export default SEO