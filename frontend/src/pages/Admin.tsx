import { useState, useEffect } from 'react'
import {
  Container, Heading, Grid, Card, CardBody, Text,
  Stat, StatLabel, StatNumber, Tabs, TabList, TabPanels,
  Tab, TabPanel, Spinner, Center
} from '@chakra-ui/react'
import { useAuth } from '../contexts/AuthContext'
import { adminAPI } from '../utils/api'
import { useNavigate } from 'react-router-dom'
import RecipesAdmin from '../components/Admin/RecipesAdmin'
import ArticlesAdmin from '../components/Admin/ArticlesAdmin'
import OrdersAdmin from '../components/Admin/OrdersAdmin'
import UsersAdmin from '../components/Admin/UsersAdmin'

interface DashboardStats {
  total_users: number
  total_recipes: number
  total_articles: number
  total_menu_plans: number
  total_orders: number
  pending_orders: number
  active_users: number
}

const Admin = () => {
  const { user } = useAuth()
  console.log(user, ' user')
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user && !user.is_admin) {
      navigate('/')
    }
  }, [user])

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await adminAPI.getDashboard()
      setStats(response.data.stats)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  return (
    <Container maxW="1400px" py={8}>
      <Heading mb={8}>Панель администратора</Heading>

      {/* Статистика */}
      {stats && (
        <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4} mb={8}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Пользователи</StatLabel>
                <StatNumber>{stats.total_users}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Рецепты</StatLabel>
                <StatNumber>{stats.total_recipes}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Статьи</StatLabel>
                <StatNumber>{stats.total_articles}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Заказы</StatLabel>
                <StatNumber>{stats.total_orders}</StatNumber>
                <Text fontSize="sm" color="orange.500">
                  {stats.pending_orders} ожидают
                </Text>
              </Stat>
            </CardBody>
          </Card>
        </Grid>
      )}

      {/* Вкладки */}
      <Tabs variant="enclosed">
        <TabList>
          <Tab>Рецепты</Tab>
          <Tab>Статьи</Tab>
          <Tab>Заказы</Tab>
          <Tab>Пользователи</Tab>
        </TabList>

        <TabPanels>
          <TabPanel><RecipesAdmin /></TabPanel>
          <TabPanel><ArticlesAdmin /></TabPanel>
          <TabPanel><OrdersAdmin /></TabPanel>
          <TabPanel><UsersAdmin /></TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  )
}

export default Admin