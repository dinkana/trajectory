import type { SkillTree } from '@/types'

export const presetTrees: SkillTree[] = [
  {
    id: 'preset-javascript-basics',
    title: 'JavaScript: Основы',
    description: 'Базовый курс по JavaScript для начинающих',
    nodes: [
      { id: 'js-1', title: 'Переменные', x: 100, y: 100 },
      { id: 'js-2', title: 'Типы данных', x: 300, y: 100 },
      { id: 'js-3', title: 'Операторы', x: 500, y: 100 },
      { id: 'js-4', title: 'Условия (if/else)', x: 200, y: 250 },
      { id: 'js-5', title: 'Циклы', x: 400, y: 250 },
      { id: 'js-6', title: 'Функции', x: 300, y: 400 },
      { id: 'js-7', title: 'Массивы', x: 150, y: 550 },
      { id: 'js-8', title: 'Объекты', x: 450, y: 550 }
    ],
    edges: [
      { id: 'e1', from: 'js-1', to: 'js-2' },
      { id: 'e2', from: 'js-2', to: 'js-3' },
      { id: 'e3', from: 'js-3', to: 'js-4' },
      { id: 'e4', from: 'js-3', to: 'js-5' },
      { id: 'e5', from: 'js-4', to: 'js-6' },
      { id: 'e6', from: 'js-5', to: 'js-6' },
      { id: 'e7', from: 'js-6', to: 'js-7' },
      { id: 'e8', from: 'js-6', to: 'js-8' }
    ]
  },
  {
    id: 'preset-python-basics',
    title: 'Python: Основы',
    description: 'Введение в программирование на Python',
    nodes: [
      { id: 'py-1', title: 'Установка Python', x: 100, y: 100 },
      { id: 'py-2', title: 'Переменные', x: 300, y: 100 },
      { id: 'py-3', title: 'Типы данных', x: 500, y: 100 },
      { id: 'py-4', title: 'Ввод/Вывод', x: 200, y: 250 },
      { id: 'py-5', title: 'Условия', x: 400, y: 250 },
      { id: 'py-6', title: 'Циклы', x: 300, y: 400 },
      { id: 'py-7', title: 'Функции', x: 200, y: 550 },
      { id: 'py-8', title: 'Списки', x: 400, y: 550 }
    ],
    edges: [
      { id: 'e1', from: 'py-1', to: 'py-2' },
      { id: 'e2', from: 'py-2', to: 'py-3' },
      { id: 'e3', from: 'py-3', to: 'py-4' },
      { id: 'e4', from: 'py-3', to: 'py-5' },
      { id: 'e5', from: 'py-4', to: 'py-6' },
      { id: 'e6', from: 'py-5', to: 'py-6' },
      { id: 'e7', from: 'py-6', to: 'py-7' },
      { id: 'e8', from: 'py-6', to: 'py-8' }
    ]
  },
  {
    id: 'preset-math-algebra',
    title: 'Алгебра: Базовые темы',
    description: 'Основные разделы школьной алгебры',
    nodes: [
      { id: 'm-1', title: 'Числа', x: 100, y: 100 },
      { id: 'm-2', title: 'Выражения', x: 300, y: 100 },
      { id: 'm-3', title: 'Уравнения', x: 500, y: 100 },
      { id: 'm-4', title: 'Линейные', x: 200, y: 250 },
      { id: 'm-5', title: 'Квадратные', x: 400, y: 250 },
      { id: 'm-6', title: 'Неравенства', x: 300, y: 400 },
      { id: 'm-7', title: 'Системы', x: 200, y: 550 },
      { id: 'm-8', title: 'Функции', x: 400, y: 550 }
    ],
    edges: [
      { id: 'e1', from: 'm-1', to: 'm-2' },
      { id: 'e2', from: 'm-2', to: 'm-3' },
      { id: 'e3', from: 'm-3', to: 'm-4' },
      { id: 'e4', from: 'm-3', to: 'm-5' },
      { id: 'e5', from: 'm-4', to: 'm-6' },
      { id: 'e6', from: 'm-5', to: 'm-6' },
      { id: 'e7', from: 'm-6', to: 'm-7' },
      { id: 'e8', from: 'm-6', to: 'm-8' }
    ]
  }
]