import type { SkillTree } from '@/types';

export const advancedTrees: SkillTree[] = [
  {
    id: 'preset-system-design',
    title: 'Системный дизайн',
    description: 'Проектирование высоконагруженных систем.',
    nodes: [
      { id: 'sd-1', title: 'Масштабирование', x: 100, y: 100, timeHours: 6, cheatsheet: 'Вертикальное vs Горизонтальное.\nLoad Balancer (Nginx).' },
      { id: 'sd-2', title: 'Базы данных', x: 300, y: 100, timeHours: 8, cheatsheet: 'SQL vs NoSQL.\nРепликация, Шардирование.' },
      { id: 'sd-3', title: 'Кэширование', x: 500, y: 100, timeHours: 5, cheatsheet: 'Redis / Memcached.\nCDN для статики.' },
      { id: 'sd-4', title: 'Очереди сообщений', x: 200, y: 250, timeHours: 6, cheatsheet: 'RabbitMQ - сложные маршруты.\nKafka - высокие throughput.' },
      { id: 'sd-5', title: 'Микросервисы', x: 400, y: 250, timeHours: 8, cheatsheet: 'REST, gRPC, GraphQL.\nService Discovery.' },
      { id: 'sd-6', title: 'Паттерны', x: 300, y: 400, timeHours: 6, cheatsheet: 'CQRS, Event Sourcing, Circuit Breaker.' }
    ],
    edges: [
      { id: 'e1', from: 'sd-1', to: 'sd-2' }, { id: 'e2', from: 'sd-2', to: 'sd-3' },
      { id: 'e3', from: 'sd-1', to: 'sd-4' }, { id: 'e4', from: 'sd-3', to: 'sd-5' },
      { id: 'e5', from: 'sd-4', to: 'sd-5' }, { id: 'e6', from: 'sd-5', to: 'sd-6' }
    ]
  },
  {
    id: 'preset-cybersecurity',
    title: 'Кибербезопасность',
    description: 'Основы защиты систем и данных.',
    nodes: [
      { id: 'sec-1', title: 'Сети и ОС', x: 100, y: 100, timeHours: 8, cheatsheet: 'TCP/IP, DNS, HTTP/HTTPS.\nLinux: права, логи, iptables.' },
      { id: 'sec-2', title: 'Криптография', x: 300, y: 100, timeHours: 6, cheatsheet: 'Хэши (SHA-256).\nСимметричное (AES) / Асимметричное (RSA).' },
      { id: 'sec-3', title: 'Веб-уязвимости', x: 500, y: 100, timeHours: 8, cheatsheet: 'XSS, SQLi, CSRF.' },
      { id: 'sec-4', title: 'Инструменты', x: 200, y: 250, timeHours: 6, cheatsheet: 'Nmap, Burp Suite, Metasploit.' },
      { id: 'sec-5', title: 'Социальная инженерия', x: 400, y: 250, timeHours: 4, cheatsheet: 'Фишинг, Претекстинг.' },
      { id: 'sec-6', title: 'Защита и мониторинг', x: 300, y: 400, timeHours: 6, cheatsheet: 'WAF, IDS/IPS, SIEM.' }
    ],
    edges: [
      { id: 'e1', from: 'sec-1', to: 'sec-2' }, { id: 'e2', from: 'sec-2', to: 'sec-3' },
      { id: 'e3', from: 'sec-1', to: 'sec-4' }, { id: 'e4', from: 'sec-3', to: 'sec-5' },
      { id: 'e5', from: 'sec-4', to: 'sec-5' }, { id: 'e6', from: 'sec-5', to: 'sec-6' }
    ]
  },
  {
    id: 'preset-git-vcs',
    title: 'Git и Командная работа',
    description: 'Контроль версий и совместная разработка.',
    nodes: [
      { id: 'git-1', title: 'Основы Git', x: 100, y: 100, timeHours: 3, cheatsheet: 'init, add, commit, status, log.' },
      { id: 'git-2', title: 'Ветвление', x: 300, y: 100, timeHours: 4, cheatsheet: 'branch, merge, checkout.\nFast-forward vs Three-way.' },
      { id: 'git-3', title: 'Удаленные репо', x: 500, y: 100, timeHours: 3, cheatsheet: 'clone, push, pull, fetch.' },
      { id: 'git-4', title: 'Конфликты', x: 200, y: 250, timeHours: 4, cheatsheet: 'rebase, revert, reset, stash.' },
      { id: 'git-5', title: 'Стратегии ветвления', x: 400, y: 250, timeHours: 3, cheatsheet: 'Git Flow, GitHub Flow, Trunk Based.' },
      { id: 'git-6', title: 'Pull Requests', x: 300, y: 400, timeHours: 3, cheatsheet: 'Code Review, Conventional Commits.' }
    ],
    edges: [
      { id: 'e1', from: 'git-1', to: 'git-2' }, { id: 'e2', from: 'git-2', to: 'git-3' },
      { id: 'e3', from: 'git-1', to: 'git-4' }, { id: 'e4', from: 'git-3', to: 'git-5' },
      { id: 'e5', from: 'git-4', to: 'git-5' }, { id: 'e6', from: 'git-5', to: 'git-6' }
    ]
  },
  {
    id: 'preset-qa-testing',
    title: 'Тестирование ПО и QA',
    description: 'Обеспечение качества: от теории до автоматизации.',
    nodes: [
      { id: 'qa-1', title: 'Теория тестирования', x: 100, y: 100, timeHours: 4, cheatsheet: 'Функциональное vs Нефункциональное.\nПирамида тестирования.' },
      { id: 'qa-2', title: 'Тест-дизайн', x: 300, y: 100, timeHours: 5, cheatsheet: 'Классы эквивалентности.\nГраничные значения.' },
      { id: 'qa-3', title: 'Ручное тестирование', x: 500, y: 100, timeHours: 4, cheatsheet: 'Тест-кейс, Чек-лист, Баг-репорт.' },
      { id: 'qa-4', title: 'Автоматизация UI', x: 200, y: 250, timeHours: 8, cheatsheet: 'Selenium, Playwright, Cypress.\nPage Object Model.' },
      { id: 'qa-5', title: 'API тестирование', x: 400, y: 250, timeHours: 6, cheatsheet: 'Postman, REST Assured.\nSwagger/OpenAPI.' },
      { id: 'qa-6', title: 'Нагрузочное', x: 300, y: 400, timeHours: 5, cheatsheet: 'JMeter, k6, Gatling.\nRPS, Latency, Error Rate.' }
    ],
    edges: [
      { id: 'e1', from: 'qa-1', to: 'qa-2' }, { id: 'e2', from: 'qa-2', to: 'qa-3' },
      { id: 'e3', from: 'qa-1', to: 'qa-4' }, { id: 'e4', from: 'qa-3', to: 'qa-5' },
      { id: 'e5', from: 'qa-4', to: 'qa-5' }, { id: 'e6', from: 'qa-5', to: 'qa-6' }
    ]
  },
  {
    id: 'preset-mobile-dev',
    title: 'Мобильная разработка',
    description: 'Создание приложений для iOS и Android.',
    nodes: [
      { id: 'mob-1', title: 'Выбор стека', x: 100, y: 100, timeHours: 3, cheatsheet: 'Native (Swift/Kotlin) vs Cross-platform (RN/Flutter).' },
      { id: 'mob-2', title: 'Основы фреймворка', x: 300, y: 100, timeHours: 10, cheatsheet: 'RN: JS/TS, нативные компоненты.\nFlutter: Dart, собственный движок.' },
      { id: 'mob-3', title: 'Навигация', x: 500, y: 100, timeHours: 4, cheatsheet: 'Stack, Tab, Drawer.\nDeep linking.' },
      { id: 'mob-4', title: 'Сеть и Состояние', x: 200, y: 250, timeHours: 6, cheatsheet: 'Axios / Fetch.\nZustand / Redux.\nOffline-first.' },
      { id: 'mob-5', title: 'Работа с устройством', x: 400, y: 250, timeHours: 6, cheatsheet: 'Камера, Геолокация, Push.\nБиометрия, AsyncStorage.' },
      { id: 'mob-6', title: 'Публикация', x: 300, y: 400, timeHours: 4, cheatsheet: 'Сборка билдов (IPA, AAB).\nМодерация сторов, ASO.' }
    ],
    edges: [
      { id: 'e1', from: 'mob-1', to: 'mob-2' }, { id: 'e2', from: 'mob-2', to: 'mob-3' },
      { id: 'e3', from: 'mob-1', to: 'mob-4' }, { id: 'e4', from: 'mob-3', to: 'mob-5' },
      { id: 'e5', from: 'mob-4', to: 'mob-5' }, { id: 'e6', from: 'mob-5', to: 'mob-6' }
    ]
  },
  {
    id: 'preset-product-management',
    title: 'Product Management',
    description: 'Управление продуктом, аналитика и работа с командой.',
    nodes: [
      { id: 'pm-1', title: 'Исследование рынка', x: 100, y: 100, timeHours: 5, cheatsheet: 'CustDev - интервью с пользователями.\nTAM/SAM/SOM - оценка объема рынка.' },
      { id: 'pm-2', title: 'Продуктовая стратегия', x: 300, y: 100, timeHours: 6, cheatsheet: 'Vision & Mission.\nOKR - цели и ключевые результаты.\nRoadmap - дорожная карта.' },
      { id: 'pm-3', title: 'Юнит-экономика', x: 500, y: 100, timeHours: 8, cheatsheet: 'LTV - пожизненная ценность.\nCAC - стоимость привлечения.\nLTV/CAC > 3 - здоровая экономика.' },
      { id: 'pm-4', title: 'Метрики и Аналитика', x: 200, y: 250, timeHours: 7, cheatsheet: 'AARRR (Pirate Metrics).\nDAU/MAU, Retention Rate.' },
      { id: 'pm-5', title: 'Приоритизация бэклога', x: 400, y: 250, timeHours: 5, cheatsheet: 'RICE, MoSCoW, ICE.' },
      { id: 'pm-6', title: 'Запуск и Маркетинг', x: 300, y: 400, timeHours: 6, cheatsheet: 'MVP - минимально жизнеспособный продукт.\nGTM - стратегия выхода на рынок.\nProduct-Market Fit.' }
    ],
    edges: [
      { id: 'e1', from: 'pm-1', to: 'pm-2' }, { id: 'e2', from: 'pm-2', to: 'pm-3' },
      { id: 'e3', from: 'pm-1', to: 'pm-4' }, { id: 'e4', from: 'pm-3', to: 'pm-5' },
      { id: 'e5', from: 'pm-4', to: 'pm-5' }, { id: 'e6', from: 'pm-5', to: 'pm-6' }
    ]
  }
];