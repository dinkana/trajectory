import type { SkillTree } from '@/types';

export const programmingTrees: SkillTree[] = [
  {
    id: 'preset-javascript-basics',
    title: 'JavaScript: Путь от Новичка до Pro',
    description: 'Фундамент веб-разработки. Синтаксис, DOM, асинхронность.',
    nodes: [
      { id: 'js-1', title: 'Переменные и Типы', x: 100, y: 100, timeHours: 2, cheatsheet: 'let - изменяемая\nconst - неизменяемая ссылка\nvar - устарело\n\nТипы: string, number, boolean, null, undefined, object, symbol, bigint' },
      { id: 'js-2', title: 'Функции и Замыкания', x: 300, y: 100, timeHours: 3, cheatsheet: 'function declaration - всплывает\narrow function - нет своего this\n\nЗамыкание: функция запоминает лексическое окружение.' },
      { id: 'js-3', title: 'Массивы и Объекты', x: 500, y: 100, timeHours: 3, cheatsheet: 'map/filter/reduce\nSpread operator: [...arr]\nDestructuring: const { a, b } = obj' },
      { id: 'js-4', title: 'DOM и События', x: 200, y: 250, timeHours: 4, cheatsheet: 'querySelector\naddEventListener\nEvent Delegation' },
      { id: 'js-5', title: 'Асинхронность', x: 400, y: 250, timeHours: 5, cheatsheet: 'Promise\nasync/await\nEvent Loop' },
      { id: 'js-6', title: 'ES6+ Модули', x: 300, y: 400, timeHours: 2, cheatsheet: 'import/export\nNPM / PNPM\nTypeScript' }
    ],
    edges: [
      { id: 'e1', from: 'js-1', to: 'js-2' }, { id: 'e2', from: 'js-2', to: 'js-3' },
      { id: 'e3', from: 'js-1', to: 'js-4' }, { id: 'e4', from: 'js-3', to: 'js-5' },
      { id: 'e5', from: 'js-4', to: 'js-5' }, { id: 'e6', from: 'js-5', to: 'js-6' }
    ]
  },
  {
    id: 'preset-python-basics',
    title: 'Python: Базовый Синтаксис и Логика',
    description: 'Вход в IT, Data Science и автоматизацию.',
    nodes: [
      { id: 'py-1', title: 'Установка и Синтаксис', x: 100, y: 100, timeHours: 1, cheatsheet: 'Индентация обязательна (4 пробела)\n# комментарий\nprint() - вывод\ninput() - ввод' },
      { id: 'py-2', title: 'Структуры Данных', x: 300, y: 100, timeHours: 3, cheatsheet: 'list [] - изменяемый\ntuple () - неизменяемый\ndict {} - хэш-таблица\nset {} - уникальные' },
      { id: 'py-3', title: 'Функции и ООП', x: 500, y: 100, timeHours: 5, cheatsheet: 'def func(): ...\nclass MyClass:\n  def __init__(self): ...\n\nНаследование: class Child(Parent)' },
      { id: 'py-4', title: 'Файлы и ОС', x: 200, y: 250, timeHours: 2, cheatsheet: 'with open("file.txt", "r") as f:\n  data = f.read()' },
      { id: 'py-5', title: 'Библиотеки и Pip', x: 400, y: 250, timeHours: 2, cheatsheet: 'pip install requests\nvirtualenv\nrequirements.txt' }
    ],
    edges: [
      { id: 'e1', from: 'py-1', to: 'py-2' }, { id: 'e2', from: 'py-2', to: 'py-3' },
      { id: 'e3', from: 'py-1', to: 'py-4' }, { id: 'e4', from: 'py-3', to: 'py-5' },
      { id: 'e5', from: 'py-4', to: 'py-5' }
    ]
  }
];