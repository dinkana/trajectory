import type { SkillTree } from '@/types';

export const mathTrees: SkillTree[] = [
  {
    id: 'preset-math-algebra',
    title: 'Алгебра: Фундамент для IT и Data',
    description: 'Логика, функции и основы анализа данных.',
    nodes: [
      { id: 'm-1', title: 'Линейные Уравнения', x: 100, y: 100, timeHours: 2, cheatsheet: 'ax + b = 0\nx = -b/a\nГрафик - прямая линия.' },
      { id: 'm-2', title: 'Функции и Графики', x: 300, y: 100, timeHours: 3, cheatsheet: 'f(x) - зависимость y от x.\nDomain & Range.\nЧетность/Нечетность.' },
      { id: 'm-3', title: 'Системы Уравнений', x: 500, y: 100, timeHours: 3, cheatsheet: 'Метод подстановки.\nМетод сложения.\nМатричный метод.' },
      { id: 'm-4', title: 'Логарифмы и Степени', x: 300, y: 250, timeHours: 4, cheatsheet: 'a^x = b <=> log_a(b) = x\nСвойства степеней для Big O.' }
    ],
    edges: [
      { id: 'e1', from: 'm-1', to: 'm-2' }, { id: 'e2', from: 'm-2', to: 'm-3' },
      { id: 'e3', from: 'm-2', to: 'm-4' }
    ]
  }
];