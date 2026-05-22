import { useState, useEffect, useRef } from 'react'
import {
  Box, Button, Table, Thead, Tbody, Tr, Th, Td, Flex,
  Heading, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalCloseButton, useDisclosure, FormControl,
  FormLabel, Input, Textarea, Select, Stack, useToast, Badge, Image, Progress, Text
} from '@chakra-ui/react'
import { adminAPI } from '../../utils/api'
import { type Article } from '../../types'

const ArticlesAdmin = () => {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    title: '',
    content: '',
    author: '',
    category: 'nutrition',
    read_time: '',
    image_url: '',
    tags: '',
  })

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    setIsLoading(true)
    try {
      const response = await adminAPI.getArticles()
      setArticles(response.data)
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      title: '', content: '', author: '',
      category: 'nutrition', read_time: '',
      image_url: '', tags: '',
    })
    setImagePreview(null)
  }

  const handleOpen = () => {
    resetForm()
    onOpen()
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Проверка типа файла
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

    // Проверка размера (макс 5MB)
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
      // Локальное превью
      const localPreview = URL.createObjectURL(file)
      setImagePreview(localPreview)

      // Загружаем в MinIO
      const formData = new FormData()
      formData.append('file', file)
      const response = await adminAPI.uploadImage(formData)

      setForm(prev => ({ ...prev, image_url: response.data.url }))
      toast({ title: 'Изображение загружено', status: 'success', duration: 3000 })
    } catch (error) {
      toast({ title: 'Ошибка загрузки', status: 'error', duration: 3000 })
      setImagePreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const data = {
        title: form.title,
        content: form.content,
        author: form.author,
        category: form.category,
        read_time: Number(form.read_time),
        image_url: form.image_url || null,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      }

      await adminAPI.createArticle(data)
      toast({ title: 'Статья добавлена', status: 'success', duration: 3000 })
      onClose()
      fetchArticles()
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Проверьте правильность данных', status: 'error', duration: 3000 })
    }
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Статьи ({articles.length})</Heading>
        <Button colorScheme="green" onClick={handleOpen}>
          + Добавить статью
        </Button>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Заголовок</Th>
              <Th>Автор</Th>
              <Th>Категория</Th>
              <Th>Время чтения</Th>
              <Th>Дата</Th>
            </Tr>
          </Thead>
          <Tbody>
            {articles.map((article) => (
              <Tr key={article.id}>
                <Td>{article.id}</Td>
                <Td>{article.title}</Td>
                <Td>{article.author}</Td>
                <Td><Badge>{article.category}</Badge></Td>
                <Td>{article.read_time} мин</Td>
                <Td>{new Date(article.published_at).toLocaleDateString('ru-RU')}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Модалка добавления статьи */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Добавить статью</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Заголовок</FormLabel>
                <Input
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Содержание</FormLabel>
                <Textarea
                  value={form.content}
                  onChange={e => setForm({...form, content: e.target.value})}
                  rows={8}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Автор</FormLabel>
                <Input
                  value={form.author}
                  onChange={e => setForm({...form, author: e.target.value})}
                />
              </FormControl>

              <Flex gap={4}>
                <FormControl>
                  <FormLabel>Категория</FormLabel>
                  <Select
                    value={form.category}
                    onChange={e => setForm({...form, category: e.target.value})}
                  >
                    <option value="nutrition">Питание</option>
                    <option value="fitness">Фитнес</option>
                    <option value="health">Здоровье</option>
                    <option value="wellness">Велнес</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Время чтения (мин)</FormLabel>
                  <Input
                    type="number"
                    value={form.read_time}
                    onChange={e => setForm({...form, read_time: e.target.value})}
                  />
                </FormControl>
              </Flex>

              {/* <FormControl>
                <FormLabel>URL изображения</FormLabel>
                <Input
                  value={form.image_url}
                  onChange={e => setForm({...form, image_url: e.target.value})}
                  placeholder="/uploads/images/article.jpg"
                />
              </FormControl> */}
              <FormControl>
                <FormLabel>Изображение</FormLabel>

                {imagePreview && (
                  <Box mb={2}>
                    <Image src={imagePreview} alt="Preview" maxH="150px" borderRadius="md" objectFit="cover" />
                  </Box>
                )}

                {isUploading && (
                  <Box mb={2}>
                    <Text fontSize="sm" mb={1}>Загрузка...</Text>
                    <Progress isIndeterminate colorScheme="green" size="sm" />
                  </Box>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />

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

                {form.image_url && (
                  <Text fontSize="xs" color="gray.500" mt={1}>{form.image_url}</Text>
                )}
              </FormControl>

              <FormControl>
                <FormLabel>Теги (через запятую)</FormLabel>
                <Input
                  value={form.tags}
                  onChange={e => setForm({...form, tags: e.target.value})}
                  placeholder="питание, здоровье, советы"
                />
              </FormControl>

              <Button colorScheme="green" onClick={handleSubmit}>
                Добавить статью
              </Button>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default ArticlesAdmin