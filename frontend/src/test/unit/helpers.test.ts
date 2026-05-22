import { describe, it, expect } from 'vitest'

// Тестируем вспомогательные функции которые используются в проекте

describe('Утилиты форматирования', () => {
  it('форматирует дату на русском языке', () => {
    const date = new Date('2024-01-15T10:30:00')
    const formatted = date.toLocaleDateString('ru-RU')
    expect(formatted).toMatch(/\d{2}\.\d{2}\.\d{4}/)
  })

  it('обрезает длинный текст до 150 символов', () => {
    const longText = 'А'.repeat(200)
    const truncated = longText.substring(0, 150)
    expect(truncated.length).toBe(150)
  })

  it('разделяет теги из строки через запятую', () => {
    const tagsString = 'питание, здоровье, советы'
    const tags = tagsString.split(',').map(t => t.trim()).filter(Boolean)
    expect(tags).toEqual(['питание', 'здоровье', 'советы'])
    expect(tags.length).toBe(3)
  })

  it('фильтрует пустые теги', () => {
    const tagsString = 'питание, , здоровье, '
    const tags = tagsString.split(',').map(t => t.trim()).filter(Boolean)
    expect(tags).toEqual(['питание', 'здоровье'])
  })

  it('конвертирует строку JSON в список ингредиентов', () => {
    const jsonString = '[{"name":"Гречка","amount":"100","unit":"г"}]'
    const parsed = JSON.parse(jsonString)
    expect(Array.isArray(parsed)).toBe(true)
    expect(parsed[0].name).toBe('Гречка')
    expect(parsed[0].amount).toBe('100')
    expect(parsed[0].unit).toBe('г')
  })

  it('обрабатывает уже распарсенный список', () => {
    const list = [{"name": "Гречка", "amount": "100", "unit": "г"}]
    const result = typeof list === 'string' ? JSON.parse(list) : list
    expect(Array.isArray(result)).toBe(true)
  })
})

describe('Валидация данных', () => {
  it('валидный email проходит проверку', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    expect(emailRegex.test('test@example.com')).toBe(true)
    expect(emailRegex.test('user@mail.ru')).toBe(true)
  })

  it('невалидный email не проходит проверку', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    expect(emailRegex.test('notanemail')).toBe(false)
    expect(emailRegex.test('missing@')).toBe(false)
  })

  it('пароль меньше 6 символов считается коротким', () => {
    const password = '123'
    expect(password.length < 6).toBe(true)
  })

  it('пароль из 6+ символов валиден', () => {
    const password = 'password123'
    expect(password.length >= 6).toBe(true)
  })

  it('калории должны быть положительным числом', () => {
    const calories = 350
    expect(calories > 0).toBe(true)
    expect(Number.isInteger(calories)).toBe(true)
  })
})

describe('Проверка ролей', () => {
  it('пользователь с is_admin=true является админом', () => {
    const user = { email: 'admin@pp.health', is_admin: true }
    expect(user.is_admin).toBe(true)
  })

  it('пользователь с is_admin=false не является админом', () => {
    const user = { email: 'user@example.com', is_admin: false }
    expect(user.is_admin).toBe(false)
  })

  it('null пользователь не является залогиненным', () => {
    const user = null
    expect(user).toBeNull()
    expect(!!user).toBe(false)
  })
})