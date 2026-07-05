import type { SkillTree } from '@/types';

export const languageTrees: SkillTree[] = [
  {
    id: 'preset-english-a1-b2',
    title: 'Английский: A1 → B2',
    description: 'Разговорный и технический английский.',
    nodes: [
      { id: 'en-1', title: 'Алфавит и Фонетика', x: 100, y: 100, timeHours: 2, cheatsheet: 'IPA - ключ к правильному чтению.\nЗвуки важнее букв.' },
      { id: 'en-2', title: 'Базовые Времена', x: 300, y: 100, timeHours: 5, cheatsheet: 'Present Simple: I work (факт)\nPresent Continuous: I am working (процесс)\nPast Simple: I worked (факт в прошлом)' },
      { id: 'en-3', title: 'Словарный Запас', x: 500, y: 100, timeHours: 10, cheatsheet: 'Учить слова в контексте, не списком.\nКолокации важнее одиночных слов.' },
      { id: 'en-4', title: 'Аудирование и Говорение', x: 200, y: 250, timeHours: 10, cheatsheet: 'Shadowing: Повторяй за диктором одновременно.\nЗаписывай себя на диктофон.' },
      { id: 'en-5', title: 'Сложная Грамматика', x: 400, y: 250, timeHours: 8, cheatsheet: 'Conditionals (If...)\nPassive Voice\nReported Speech' },
      { id: 'en-6', title: 'IT Английский', x: 300, y: 400, timeHours: 5, cheatsheet: 'Deploy, Commit, Push, Pull, Bug, Feature, Legacy, Stack.' }
    ],
    edges: [
      { id: 'e1', from: 'en-1', to: 'en-2' }, { id: 'e2', from: 'en-2', to: 'en-3' },
      { id: 'e3', from: 'en-1', to: 'en-4' }, { id: 'e4', from: 'en-3', to: 'en-5' },
      { id: 'e5', from: 'en-4', to: 'en-5' }, { id: 'e6', from: 'en-5', to: 'en-6' }
    ]
  },
  {
    id: 'preset-chinese-hsk',
    title: 'Китайский: HSK 1-3',
    description: 'Мандаринский диалект. Иероглифика и тона.',
    nodes: [
      { id: 'cn-1', title: 'Пиньинь и Тоны', x: 100, y: 100, timeHours: 3, cheatsheet: '4 тона + нейтральный.\nТон меняет смысл!' },
      { id: 'cn-2', title: 'Ключи и Порядок черт', x: 300, y: 100, timeHours: 5, cheatsheet: 'Иероглиф = Корень + Фонетик.\nПорядок черт: Сверху вниз, Слева направо.' },
      { id: 'cn-3', title: 'Базовая Грамматика', x: 500, y: 100, timeHours: 5, cheatsheet: 'Порядок: Subject + Time + Place + Verb + Object.\n了 (le) - маркер завершенности.' },
      { id: 'cn-4', title: 'Словарь HSK 1-2', x: 200, y: 250, timeHours: 10, cheatsheet: 'Учить связками.\nВопрос: 吗 (ma) в конце предложения.' },
      { id: 'cn-5', title: 'Аудирование', x: 400, y: 250, timeHours: 10, cheatsheet: 'Смотреть дорамы с двойными субтитрами.' }
    ],
    edges: [
      { id: 'e1', from: 'cn-1', to: 'cn-2' }, { id: 'e2', from: 'cn-2', to: 'cn-3' },
      { id: 'e3', from: 'cn-1', to: 'cn-4' }, { id: 'e4', from: 'cn-3', to: 'cn-5' },
      { id: 'e5', from: 'cn-4', to: 'cn-5' }
    ]
  },
  {
    id: 'preset-korean-basics',
    title: 'Корейский: Хангыль и База',
    description: 'Корейский алфавит и базовая грамматика.',
    nodes: [
      { id: 'kr-1', title: 'Хангыль', x: 100, y: 100, timeHours: 2, cheatsheet: '14 согласных + 10 гласных.\nБлоки слогов: ㄱ + ㅏ = 가 (ga).' },
      { id: 'kr-2', title: 'Базовые Частицы', x: 300, y: 100, timeHours: 4, cheatsheet: '은/는 (topic)\n이/가 (subject)\n을/를 (object)' },
      { id: 'kr-3', title: 'Спряжение и Вежливость', x: 500, y: 100, timeHours: 5, cheatsheet: '-아요/어요 (политесный)\n-ㅂ니다/습니다 (формальный)' },
      { id: 'kr-4', title: 'Сленг и Культура', x: 300, y: 250, timeHours: 3, cheatsheet: 'K-Drama - лучший источник аудирования.' }
    ],
    edges: [
      { id: 'e1', from: 'kr-1', to: 'kr-2' }, { id: 'e2', from: 'kr-2', to: 'kr-3' },
      { id: 'e3', from: 'kr-3', to: 'kr-4' }
    ]
  }
];