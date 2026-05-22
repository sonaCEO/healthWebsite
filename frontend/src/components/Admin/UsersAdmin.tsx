import { useState, useEffect } from 'react'
import {
  Box, Button, Table, Thead, Tbody, Tr, Th, Td, Flex,
  Heading, useToast, Badge
} from '@chakra-ui/react'
import { adminAPI } from '../../utils/api'

interface AdminUser {
  id: number
  email: string
  full_name: string | null
  is_active: boolean
  created_orders: number
}

const UsersAdmin = () => {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await adminAPI.getUsers()
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (userId: number) => {
    try {
      await adminAPI.toggleUserActive(userId)
      toast({ title: 'Статус пользователя обновлён', status: 'success', duration: 3000 })
      fetchUsers()
    } catch (error) {
      toast({ title: 'Ошибка', status: 'error', duration: 3000 })
    }
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Пользователи ({users.length})</Heading>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Email</Th>
              <Th>Имя</Th>
              <Th>Заказы</Th>
              <Th>Статус</Th>
              <Th>Действия</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map((user) => (
              <Tr key={user.id}>
                <Td>{user.id}</Td>
                <Td>{user.email}</Td>
                <Td>{user.full_name || '—'}</Td>
                <Td>{user.created_orders}</Td>
                <Td>
                  <Badge colorScheme={user.is_active ? 'green' : 'red'}>
                    {user.is_active ? 'Активен' : 'Заблокирован'}
                  </Badge>
                </Td>
                <Td>
                  <Button
                    size="xs"
                    colorScheme={user.is_active ? 'red' : 'green'}
                    onClick={() => handleToggleActive(user.id)}
                  >
                    {user.is_active ? 'Заблокировать' : 'Разблокировать'}
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  )
}

export default UsersAdmin