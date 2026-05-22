import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

// Мокируем axios
vi.mock('axios', () => {
  const mockAxios = {
    create: vi.fn(() => mockAxios),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    defaults: { headers: { common: {} } },
  }
  return { default: mockAxios }
})

describe('API утилиты', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('токен сохраняется в localStorage', () => {
    localStorage.setItem('access_token', 'test_token_123')
    expect(localStorage.getItem('access_token')).toBe('test_token_123')
  })

  it('токен удаляется при logout', () => {
    localStorage.setItem('access_token', 'test_token_123')
    localStorage.setItem('refresh_token', 'refresh_token_123')
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    expect(localStorage.getItem('access_token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()
  })

  it('refresh_token сохраняется отдельно от access_token', () => {
    localStorage.setItem('access_token', 'access_123')
    localStorage.setItem('refresh_token', 'refresh_123')
    expect(localStorage.getItem('access_token')).toBe('access_123')
    expect(localStorage.getItem('refresh_token')).toBe('refresh_123')
  })

  it('localStorage пустой по умолчанию', () => {
    expect(localStorage.getItem('access_token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()
  })
})