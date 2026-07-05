import type { SkillTree } from '@/types';

export const itCoreTrees: SkillTree[] = [
  {
    id: 'preset-frontend-react',
    title: 'Frontend: React & Ecosystem',
    description: 'Современная разработка интерфейсов.',
    nodes: [
      { id: 'fe-1', title: 'React Core & JSX', x: 100, y: 100, timeHours: 4, cheatsheet: 'Компоненты - функции.\nProps - неизменяемые.\nJSX - синтаксический сахар.' },
      { id: 'fe-2', title: 'Hooks', x: 300, y: 100, timeHours: 6, cheatsheet: 'useState, useEffect, useRef.' },
      { id: 'fe-3', title: 'State Management', x: 500, y: 100, timeHours: 5, cheatsheet: 'Zustand / Redux Toolkit / Context API.' },
      { id: 'fe-4', title: 'Routing', x: 200, y: 250, timeHours: 3, cheatsheet: 'BrowserRouter, useNavigate, Lazy loading.' },
      { id: 'fe-5', title: 'Data Fetching', x: 400, y: 250, timeHours: 5, cheatsheet: 'useQuery, useMutation, invalidateQueries.' },
      { id: 'fe-6', title: 'Styling', x: 300, y: 400, timeHours: 4, cheatsheet: 'Utility-first, Dark mode, Адаптивность.' }
    ],
    edges: [
      { id: 'e1', from: 'fe-1', to: 'fe-2' }, { id: 'e2', from: 'fe-2', to: 'fe-3' },
      { id: 'e3', from: 'fe-1', to: 'fe-4' }, { id: 'e4', from: 'fe-2', to: 'fe-5' },
      { id: 'e5', from: 'fe-4', to: 'fe-6' }, { id: 'e6', from: 'fe-5', to: 'fe-6' }
    ]
  },
  {
    id: 'preset-backend-node',
    title: 'Backend: Node.js & Databases',
    description: 'Серверная разработка, API и работа с данными.',
    nodes: [
      { id: 'be-1', title: 'Node.js & Express', x: 100, y: 100, timeHours: 5, cheatsheet: 'Event Loop, Streams, Middleware.' },
      { id: 'be-2', title: 'REST & GraphQL', x: 300, y: 100, timeHours: 6, cheatsheet: 'HTTP методы, статус-коды, Swagger.' },
      { id: 'be-3', title: 'Databases', x: 500, y: 100, timeHours: 8, cheatsheet: 'SQL (ACID, JOINs) vs NoSQL (Документы).' },
      { id: 'be-4', title: 'ORM', x: 200, y: 250, timeHours: 4, cheatsheet: 'Schema.prisma, prisma migrate.' },
      { id: 'be-5', title: 'Auth', x: 400, y: 250, timeHours: 5, cheatsheet: 'JWT, Refresh Token, httpOnly Cookies.' },
      { id: 'be-6', title: 'Testing & CI', x: 300, y: 400, timeHours: 4, cheatsheet: 'Unit, Integration, Coverage.' }
    ],
    edges: [
      { id: 'e1', from: 'be-1', to: 'be-2' }, { id: 'e2', from: 'be-2', to: 'be-3' },
      { id: 'e3', from: 'be-1', to: 'be-4' }, { id: 'e4', from: 'be-3', to: 'be-5' },
      { id: 'e5', from: 'be-4', to: 'be-5' }, { id: 'e6', from: 'be-5', to: 'be-6' }
    ]
  },
  {
    id: 'preset-devops-basics',
    title: 'DevOps: Docker, CI/CD & Cloud',
    description: 'Инфраструктура, автоматизация и деплой.',
    nodes: [
      { id: 'do-1', title: 'Linux & Bash', x: 100, y: 100, timeHours: 6, cheatsheet: 'chmod, grep, ssh, pipe, redirect.' },
      { id: 'do-2', title: 'Docker', x: 300, y: 100, timeHours: 8, cheatsheet: 'Dockerfile, Compose, Volumes, Networks.' },
      { id: 'do-3', title: 'CI/CD', x: 500, y: 100, timeHours: 5, cheatsheet: 'Workflow, Job, Step, Secrets.' },
      { id: 'do-4', title: 'Kubernetes', x: 200, y: 250, timeHours: 10, cheatsheet: 'Pod, Deployment, Service, Ingress.' },
      { id: 'do-5', title: 'Cloud', x: 400, y: 250, timeHours: 8, cheatsheet: 'EC2, S3, RDS, IAM.' },
      { id: 'do-6', title: 'Monitoring', x: 300, y: 400, timeHours: 5, cheatsheet: 'Metrics, Alerting, ELK Stack.' }
    ],
    edges: [
      { id: 'e1', from: 'do-1', to: 'do-2' }, { id: 'e2', from: 'do-2', to: 'do-3' },
      { id: 'e3', from: 'do-1', to: 'do-4' }, { id: 'e4', from: 'do-3', to: 'do-5' },
      { id: 'e5', from: 'do-4', to: 'do-5' }, { id: 'e6', from: 'do-5', to: 'do-6' }
    ]
  },
  {
    id: 'preset-uiux-design',
    title: 'UI/UX Дизайн',
    description: 'Проектирование удобных и красивых интерфейсов.',
    nodes: [
      { id: 'ux-1', title: 'Основы UX', x: 100, y: 100, timeHours: 6, cheatsheet: 'CJM - путь пользователя.\nPersonas - портреты ЦА.\nJTBD - какую задачу закрывает продукт.' },
      { id: 'ux-2', title: 'Основы UI', x: 300, y: 100, timeHours: 8, cheatsheet: 'Типографика: иерархия, контраст.\nЦвет: 60-30-10 правило.\nСетки: 8pt grid system.' },
      { id: 'ux-3', title: 'Wireframing и Figma', x: 500, y: 100, timeHours: 10, cheatsheet: 'Low-fi -> Hi-fi.\nAuto Layout - основа адаптивности.\nComponents & Variants.' },
      { id: 'ux-4', title: 'Прототипирование', x: 200, y: 250, timeHours: 6, cheatsheet: 'Smart Animate - плавные переходы.\nInteractive Components - микро-взаимодействия.' },
      { id: 'ux-5', title: 'UX-копирайтинг', x: 400, y: 250, timeHours: 4, cheatsheet: 'Микротексты: кнопки, ошибки.\nТон голоса (Tone of Voice).\nЯсность > Креативность.' },
      { id: 'ux-6', title: 'Дизайн-системы', x: 300, y: 400, timeHours: 8, cheatsheet: 'UI Kit - набор компонентов.\nDesign Tokens - цвета, отступы.' }
    ],
    edges: [
      { id: 'e1', from: 'ux-1', to: 'ux-2' }, { id: 'e2', from: 'ux-2', to: 'ux-3' },
      { id: 'e3', from: 'ux-1', to: 'ux-4' }, { id: 'e4', from: 'ux-3', to: 'ux-5' },
      { id: 'e5', from: 'ux-4', to: 'ux-5' }, { id: 'e6', from: 'ux-5', to: 'ux-6' }
    ]
  }
];