import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Spinner, Center } from '@chakra-ui/react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (requireAdmin && !user.is_admin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute