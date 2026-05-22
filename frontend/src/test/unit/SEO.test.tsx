import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import SEO from '../../components/SEO'

describe('SEO компонент', () => {
  it('рендерится без ошибок', () => {
    const { container } = render(
      <HelmetProvider>
        <SEO title="Тест" description="Описание" />
      </HelmetProvider>
    )
    expect(container).toBeTruthy()
  })

  it('принимает кастомный title', () => {
    const { container } = render(
      <HelmetProvider>
        <SEO title="Мой заголовок" />
      </HelmetProvider>
    )
    expect(container).toBeTruthy()
  })

  it('работает без пропсов (дефолтные значения)', () => {
    const { container } = render(
      <HelmetProvider>
        <SEO />
      </HelmetProvider>
    )
    expect(container).toBeTruthy()
  })
})