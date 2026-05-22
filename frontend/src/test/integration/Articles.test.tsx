import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Articles from '../../pages/Articles'

// Мокируем API
vi.mock('../../utils/api', () => ({
  articlesAPI: {
    getAll: vi.fn().mockResolvedValue({
      data: {
        items: [
          {
            id: 1,
            title: 'Тестовая статья',
            content: 'Содержание тестовой статьи для проверки отображения',
            author: 'Тестовый автор',
            category: 'nutrition',
            read_time: 5,
            published_at: '2024-01-15T10:30:00',
            image_url: null,
            tags: ['питание', 'здоровье']
          }
        ],
        total: 1,
        page: 1,
        page_size: 6,
        total_pages: 1
      }
    })
  }
}))

const renderArticles = () => {
  return render(
    <HelmetProvider>
      <ChakraProvider>
        <MemoryRouter>
          <Articles />
        </MemoryRouter>
      </ChakraProvider>
    </HelmetProvider>
  )
}

describe('Articles страница', () => {
  it('показывает заголовок страницы', () => {
    renderArticles()
    expect(screen.getByText('Полезные статьи о здоровье и питании')).toBeTruthy()
  })

  it('загружает и отображает статьи', async () => {
    renderArticles()
    await waitFor(() => {
      expect(screen.getByText('Тестовая статья')).toBeTruthy()
    })
  })

  it('показывает количество найденных статей', async () => {
    renderArticles()
    await waitFor(() => {
      expect(screen.getByText('Найдено 1 статей')).toBeTruthy()
    })
  })

  it('показывает автора статьи', async () => {
    renderArticles()
    await waitFor(() => {
      expect(screen.getByText('Тестовый автор')).toBeTruthy()
    })
  })
})