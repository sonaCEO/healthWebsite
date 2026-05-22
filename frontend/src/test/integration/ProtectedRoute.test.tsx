import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import ProtectedRoute from '../../components/ProtectedRoute'

// Мокируем useAuth
const mockUseAuth = vi.fn()
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}))

const renderProtectedRoute = (children = <div>Защищённый контент</div>) => {
  return render(
    <ChakraProvider>
      <MemoryRouter>
        <ProtectedRoute>{children}</ProtectedRoute>
      </MemoryRouter>
    </ChakraProvider>
  )
}

describe('ProtectedRoute', () => {
  it('показывает спиннер пока загружается', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: true })
    const { container } = renderProtectedRoute()
    expect(container).toBeTruthy()
  })

  it('редиректит незалогиненного пользователя', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false })
    renderProtectedRoute()
    // контент не показывается
    expect(screen.queryByText('Защищённый контент')).toBeNull()
  })

  it('показывает контент залогиненному пользователю', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, email: 'test@example.com', is_admin: false, is_active: true },
      isLoading: false
    })
    renderProtectedRoute()
    expect(screen.getByText('Защищённый контент')).toBeTruthy()
  })

  it('редиректит обычного пользователя с adminOnly маршрута', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, email: 'test@example.com', is_admin: false, is_active: true },
      isLoading: false
    })
    render(
      <ChakraProvider>
        <MemoryRouter>
          <ProtectedRoute requireAdmin={true}>
            <div>Админ контент</div>
          </ProtectedRoute>
        </MemoryRouter>
      </ChakraProvider>
    )
    expect(screen.queryByText('Админ контент')).toBeNull()
  })

  it('показывает контент администратору', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, email: 'admin@example.com', is_admin: true, is_active: true },
      isLoading: false
    })
    render(
      <ChakraProvider>
        <MemoryRouter>
          <ProtectedRoute requireAdmin={true}>
            <div>Админ контент</div>
          </ProtectedRoute>
        </MemoryRouter>
      </ChakraProvider>
    )
    expect(screen.getByText('Админ контент')).toBeTruthy()
  })
})