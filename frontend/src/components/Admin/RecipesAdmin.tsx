import { useState, useEffect, useRef } from 'react'
import {
  Box, Button, Table, Thead, Tbody, Tr, Th, Td, Flex,
  Heading, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalCloseButton, useDisclosure, FormControl,
  FormLabel, Input, Textarea, Select, Stack, useToast,
  IconButton, Badge, Image, Progress, Text
} from '@chakra-ui/react'
import { adminAPI } from '../../utils/api'
import { type Recipe } from '../../types'

const RecipesAdmin = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null) 

  const [form, setForm] = useState({
    title: '',
    description: '',
    cooking_time: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    category: 'main',
    difficulty: 'easy',
    image_url: '',
    ingredients: '',
    instructions: '',
    tags: '',
  })

  useEffect(() => {
    fetchRecipes()
  }, [])

  const fetchRecipes = async () => {
    setIsLoading(true)
    try {
      const response = await adminAPI.getRecipes()
      console.log(response.data, ' recipes')
      setRecipes(response.data)
    } catch (error) {
      console.error('Error fetching recipes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      title: '', description: '', cooking_time: '', calories: '',
      protein: '', carbs: '', fat: '', category: 'main',
      difficulty: 'easy', image_url: '', ingredients: '',
      instructions: '', tags: '',
    })
    setImagePreview(null)
  }

  const handleOpenCreate = () => {
    setIsEditing(false)
    setSelectedRecipe(null)
    resetForm()
    onOpen()
  }

  const handleOpenEdit = (recipe: Recipe) => {
    setIsEditing(true)
    setSelectedRecipe(recipe)
    setForm({
      title: recipe.title,
      description: recipe.description,
      cooking_time: String(recipe.cooking_time),
      calories: String(recipe.calories),
      protein: String(recipe.protein),
      carbs: String(recipe.carbs),
      fat: String(recipe.fat),
      category: recipe.category,
      difficulty: recipe.difficulty,
      image_url: recipe.image_url || '',
      ingredients: JSON.stringify(recipe.ingredients, null, 2),
      instructions: recipe.instructions.join('\n'),
      tags: recipe.tags.join(', '),
    })
    setImagePreview(recipe.image_url || null)
    onOpen()
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Неверный формат',
        description: 'Допустимые форматы: JPG, PNG, GIF, WEBP',
        status: 'error',
        duration: 3000
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Файл слишком большой',
        description: 'Максимальный размер: 5MB',
        status: 'error',
        duration: 3000
      })
      return
    }

    setIsUploading(true)
    try {
      const localPreview = URL.createObjectURL(file)
      setImagePreview(localPreview)

      // загрузку в minio через adminAPI
      const formData = new FormData()
      formData.append('file', file)
      const response = await adminAPI.uploadImage(formData)

      setForm(prev => ({ ...prev, image_url: response.data.url }))

      toast({
        title: 'Изображение загружено',
        status: 'success',
        duration: 3000
      })
    } catch (error) {
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить изображение',
        status: 'error',
        duration: 3000
      })
      setImagePreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const data = {
        title: form.title,
        description: form.description,
        cooking_time: Number(form.cooking_time),
        calories: Number(form.calories),
        protein: Number(form.protein),
        carbs: Number(form.carbs),
        fat: Number(form.fat),
        category: form.category,
        difficulty: form.difficulty,
        image_url: form.image_url || null,
        ingredients: JSON.stringify(JSON.parse(form.ingredients)),
        instructions: JSON.stringify(form.instructions.split('\n').filter(i => i.trim())),
        tags: JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)),
      }

      if (isEditing && selectedRecipe) {
        await adminAPI.updateRecipe(selectedRecipe.id, data)
        toast({ title: 'Рецепт обновлён', status: 'success', duration: 3000 })
      } else {
        await adminAPI.createRecipe(data)
        toast({ title: 'Рецепт добавлен', status: 'success', duration: 3000 })
      }

      onClose()
      fetchRecipes()
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Проверьте правильность данных', status: 'error', duration: 3000 })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить рецепт?')) return
    try {
      await adminAPI.deleteRecipe(id)
      toast({ title: 'Рецепт удалён', status: 'success', duration: 3000 })
      fetchRecipes()
    } catch (error) {
      toast({ title: 'Ошибка удаления', status: 'error', duration: 3000 })
    }
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Рецепты ({recipes.length})</Heading>
        <Button colorScheme="green" onClick={handleOpenCreate}>
          + Добавить рецепт
        </Button>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Название</Th>
              <Th>Категория</Th>
              <Th>Калории</Th>
              <Th>Сложность</Th>
              <Th>Действия</Th>
            </Tr>
          </Thead>
          <Tbody>
            {recipes.map((recipe) => (
              <Tr key={recipe.id}>
                <Td>{recipe.id}</Td>
                <Td>{recipe.title}</Td>
                <Td><Badge>{recipe.category}</Badge></Td>
                <Td>{recipe.calories} ккал</Td>
                <Td>{recipe.difficulty}</Td>
                <Td>
                  <Flex gap={2}>
                    <Button size="xs" colorScheme="blue" onClick={() => handleOpenEdit(recipe)}>
                      Изменить
                    </Button>
                    <Button size="xs" colorScheme="red" onClick={() => handleDelete(recipe.id)}>
                      Удалить
                    </Button>
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditing ? 'Редактировать рецепт' : 'Добавить рецепт'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Название</FormLabel>
                <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </FormControl>

              <FormControl>
                <FormLabel>Описание</FormLabel>
                <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </FormControl>

              <Flex gap={4}>
                <FormControl>
                  <FormLabel>Категория</FormLabel>
                  <Select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option value="main">Основное</option>
                    <option value="breakfast">Завтрак</option>
                    <option value="soup">Суп</option>
                    <option value="salad">Салат</option>
                    <option value="dessert">Десерт</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Сложность</FormLabel>
                  <Select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}>
                    <option value="very_easy">Очень легко</option>
                    <option value="easy">Легко</option>
                    <option value="medium">Средне</option>
                    <option value="hard">Сложно</option>
                  </Select>
                </FormControl>
              </Flex>

              <Flex gap={4}>
                <FormControl>
                  <FormLabel>Время (мин)</FormLabel>
                  <Input type="number" value={form.cooking_time} onChange={e => setForm({...form, cooking_time: e.target.value})} />
                </FormControl>
                <FormControl>
                  <FormLabel>Калории</FormLabel>
                  <Input type="number" value={form.calories} onChange={e => setForm({...form, calories: e.target.value})} />
                </FormControl>
              </Flex>

              <Flex gap={4}>
                <FormControl>
                  <FormLabel>Белки (г)</FormLabel>
                  <Input type="number" value={form.protein} onChange={e => setForm({...form, protein: e.target.value})} />
                </FormControl>
                <FormControl>
                  <FormLabel>Жиры (г)</FormLabel>
                  <Input type="number" value={form.fat} onChange={e => setForm({...form, fat: e.target.value})} />
                </FormControl>
                <FormControl>
                  <FormLabel>Углеводы (г)</FormLabel>
                  <Input type="number" value={form.carbs} onChange={e => setForm({...form, carbs: e.target.value})} />
                </FormControl>
              </Flex>

              {/* <FormControl>
                <FormLabel>URL изображения</FormLabel>
                <Input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} placeholder="/uploads/images/recipe.jpg" />
              </FormControl> */}

              <FormControl>
                <FormLabel>Изображение</FormLabel>

                {/* Превью изображения */}
                {imagePreview && (
                  <Box mb={2}>
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      maxH="150px"
                      borderRadius="md"
                      objectFit="cover"
                    />
                  </Box>
                )}

                {/* Индикатор загрузки */}
                {isUploading && (
                  <Box mb={2}>
                    <Text fontSize="sm" mb={1}>Загрузка...</Text>
                    <Progress isIndeterminate colorScheme="green" size="sm" />
                  </Box>
                )}

                {/* Скрытый input для файла */}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />

                {/* Кнопка выбора файла */}
                <Flex gap={2} align="center">
                  <Button
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    isLoading={isUploading}
                    loadingText="Загрузка..."
                  >
                    {imagePreview ? 'Заменить изображение' : 'Выбрать изображение'}
                  </Button>
                  {imagePreview && (
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => {
                        setImagePreview(null)
                        setForm(prev => ({ ...prev, image_url: '' }))
                      }}
                    >
                      Удалить
                    </Button>
                  )}
                </Flex>

                {/* Показываем URL если уже загружено */}
                {form.image_url && (
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {form.image_url}
                  </Text>
                )}
              </FormControl>

              <FormControl>
                <FormLabel>Ингредиенты (JSON)</FormLabel>
                <Textarea
                  value={form.ingredients}
                  onChange={e => setForm({...form, ingredients: e.target.value})}
                  placeholder='[{"name": "Гречка", "amount": "100", "unit": "г"}]'
                  rows={4}
                  fontFamily="mono"
                  fontSize="sm"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Инструкции (каждый шаг с новой строки)</FormLabel>
                <Textarea
                  value={form.instructions}
                  onChange={e => setForm({...form, instructions: e.target.value})}
                  placeholder="Промойте гречку&#10;Отварите до готовности"
                  rows={4}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Теги (через запятую)</FormLabel>
                <Input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="гречка, курица, обед" />
              </FormControl>

              <Button colorScheme="green" onClick={handleSubmit}>
                {isEditing ? 'Сохранить' : 'Добавить'}
              </Button>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default RecipesAdmin