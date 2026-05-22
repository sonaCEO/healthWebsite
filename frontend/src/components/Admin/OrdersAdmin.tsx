import { useState, useEffect } from 'react'
import {
  Box, Button, Table, Thead, Tbody, Tr, Th, Td, Flex,
  Heading, Select, useToast, Badge
} from '@chakra-ui/react'
import { adminAPI } from '../../utils/api'
import { type Order } from '../../types'

const statusColors: Record<string, string> = {
  pending: 'yellow',
  confirmed: 'blue',
  preparing: 'orange',
  delivering: 'purple',
  delivered: 'green',
  cancelled: 'red',
}

const statusLabels: Record<string, string> = {
  pending: 'Ожидает',
  confirmed: 'Подтверждён',
  preparing: 'Готовится',
  delivering: 'Доставляется',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
}

const OrdersAdmin = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const response = await adminAPI.getOrders()
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus)
      toast({ title: 'Статус обновлён', status: 'success', duration: 3000 })
      fetchOrders()
    } catch (error) {
      toast({ title: 'Ошибка обновления статуса', status: 'error', duration: 3000 })
    }
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Заказы ({orders.length})</Heading>
      </Flex>

      {orders.length === 0 ? (
        <Box textAlign="center" py={10} color="gray.500">
          Заказов пока нет
        </Box>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Пользователь</Th>
                <Th>Сумма</Th>
                <Th>Адрес</Th>
                <Th>Дата</Th>
                <Th>Статус</Th>
              </Tr>
            </Thead>
            <Tbody>
              {orders.map((order) => (
                <Tr key={order.id}>
                  <Td>{order.id}</Td>
                  <Td>{order.user_id}</Td>
                  <Td>{order.total_amount} ₽</Td>
                  <Td>{order.delivery_address}</Td>
                  <Td>{new Date(order.created_at).toLocaleDateString('ru-RU')}</Td>
                  <Td>
                    <Select
                      size="xs"
                      value={order.status}
                      onChange={e => handleStatusChange(order.id, e.target.value)}
                      w="150px"
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </Select>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  )
}

export default OrdersAdmin