import { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Select,
//   VStack,
  Heading,
  Text,
  Card,
  CardBody,
  SimpleGrid
} from '@chakra-ui/react'

const CalorieCalculator = () => {
  const [formData, setFormData] = useState({
    sex: 'female',
    height: '',
    weight: '',
    age: '',
    activity: 'sedentary'
  })

  const [result, setResult] = useState<{
    bmr: number
    maintain: number
    loss: number
    moderateLoss: number
    extremeLoss: number
  } | null>(null)

  const calculateCalories = () => {
    // Формула Миффлина-Сан Жеора
    const { sex, height, weight, age, activity } = formData
    const h = Number(height)
    const w = Number(weight)
    const a = Number(age)
    
    let bmr = 0
    if (sex === 'male') {
      bmr = 10 * w + 6.25 * h - 5 * a + 5
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 161
    }

    // Множители активности
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      high: 1.725,
      veryHigh: 1.9
    }

    const maintain = Math.round(bmr * multipliers[activity as keyof typeof multipliers])
    const loss = Math.round(maintain * 0.8)       // -20%
    const moderateLoss = Math.round(maintain * 0.7) // -30%
    const extremeLoss = Math.round(maintain * 0.6)  // -40%

    setResult({ bmr, maintain, loss, moderateLoss, extremeLoss })
  }

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Онлайн-калькулятор расчета дефицита калорий для похудения
      </Heading>

      <Card mb={8}>
        <CardBody>
          <Heading size="md" mb={4}>Калькулятор калорий</Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <FormControl>
              <FormLabel>Пол</FormLabel>
              <RadioGroup value={formData.sex} onChange={(val) => setFormData({...formData, sex: val})}>
                <Stack direction="row">
                  <Radio value="female">Женский</Radio>
                  <Radio value="male">Мужской</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            <FormControl>
              <FormLabel>Рост (см)</FormLabel>
              <Input 
                type="number" 
                value={formData.height}
                onChange={(e) => setFormData({...formData, height: e.target.value})}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Вес (кг)</FormLabel>
              <Input 
                type="number" 
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Возраст (лет)</FormLabel>
              <Input 
                type="number" 
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Активность</FormLabel>
              <Select 
                value={formData.activity}
                onChange={(e) => setFormData({...formData, activity: e.target.value})}
              >
                <option value="sedentary">Сидячий образ жизни</option>
                <option value="light">Легкая активность</option>
                <option value="moderate">Средняя активность</option>
                <option value="high">Высокая активность</option>
              </Select>
            </FormControl>
          </SimpleGrid>

          <Stack direction="row" mt={6}>
            <Button colorScheme="brand" onClick={calculateCalories}>
              Считать
            </Button>
            <Button variant="outline" onClick={() => {
              setFormData({ sex: 'female', height: '', weight: '', age: '', activity: 'sedentary' })
              setResult(null)
            }}>
              Сброс
            </Button>
          </Stack>
        </CardBody>
      </Card>

      {result && (
        <Card bg="brand.50">
          <CardBody>
            <Heading size="md" mb={4}>
              Суточная норма калорий по формуле Миффлина–Сан Жеора — {result.maintain} ккал
            </Heading>
            
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Box p={4} bg="white" borderRadius="md">
                <Text fontWeight="bold" mb={2}>Для похудения в безопасном режиме</Text>
                <Text fontSize="xl" color="brand.600" mb={2}>до {result.loss} ккал</Text>
                <Text fontSize="sm" color="gray.600">Через неделю вы похудете на 0,28 кг, а через месяц на 1,21 кг</Text>
              </Box>
              
              <Box p={4} bg="white" borderRadius="md">
                <Text fontWeight="bold" mb={2}>Для похудения в быстром режиме</Text>
                <Text fontSize="xl" color="brand.600" mb={2}>до {result.moderateLoss} ккал</Text>
                <Text fontSize="sm" color="gray.600">Через неделю вы похудете на 0,42 кг, а через месяц на 1,82 кг</Text>
              </Box>
              
              <Box p={4} bg="white" borderRadius="md">
                <Text fontWeight="bold" mb={2}>Для похудения в экстренном режиме</Text>
                <Text fontSize="xl" color="brand.600" mb={2}>до {result.extremeLoss} ккал</Text>
                <Text fontSize="sm" color="gray.600">Через неделю вы похудете на 0,57 кг, а через месяц на 2,42 кг</Text>
              </Box>
            </SimpleGrid>
            
            <Button colorScheme="brand" mt={6} w="full">
              Купить меню
            </Button>
          </CardBody>
        </Card>
      )}
    </Box>
  )
}

export default CalorieCalculator