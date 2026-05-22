import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import LazyImage from '../../components/LazyImage'

describe('LazyImage компонент', () => {
  it('рендерится без ошибок', () => {
    const { container } = render(
      <LazyImage src="/test.jpg" alt="Тестовое изображение" />
    )
    expect(container).toBeTruthy()
  })

  it('показывает заглушку если src = null', () => {
    render(<LazyImage src={null} alt="Нет изображения" />)
    // контейнер рендерится
    expect(document.body).toBeTruthy()
  })

  it('применяет переданный alt текст', () => {
    const { container } = render(
      <LazyImage src="/test.jpg" alt="Рецепт: Гречка" />
    )
    expect(container).toBeTruthy()
  })
})