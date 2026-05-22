import { useState, useRef, useEffect } from 'react'
import { Box, Skeleton } from '@chakra-ui/react'

interface LazyImageProps {
  src: string | null
  alt: string
  height?: string
  borderRadius?: string
}

const LazyImage = ({ src, alt, height = "200px", borderRadius = "md" }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // IntersectionObserver - загружаем изображение только когда оно видно
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <Box ref={imgRef} height={height} borderRadius={borderRadius} overflow="hidden">
      {/* Показываем скелетон пока изображение не загружено */}
      {!isLoaded && <Skeleton height={height} borderRadius={borderRadius} />}

      {/* Загружаем изображение только когда оно в зоне видимости */}
      {isInView && src && (
        <img
          src={src}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: isLoaded ? 'block' : 'none',
            borderRadius,
          }}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"  // нативный lazy loading браузера
        />
      )}

      {isInView && !src && (
        <Box
          height={height}
          bg="gray.100"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius={borderRadius}
        >
          🍽️
        </Box>
      )}
    </Box>
  )
}

export default LazyImage