import type { SkillTree } from '@/types';

export const presetTrees: SkillTree[] = [
  {
    id: 'social-adaptation',
    title: 'Адаптация после выпуска',
    description: 'Базовые шаги для самостоятельной жизни после детского дома.',
    nodes: [
      { id: 's1', title: 'Паспорт и документы', x: 100, y: 100, timeHours: 2, description: 'Восстановление или получение паспорта после выпуска.', resources: [{ title: 'Госуслуги - получение паспорта', url: 'https://www.gosuslugi.ru/191004', type: 'docs' }, { title: 'МФЦ - список документов', url: 'https://www.mfc.ru', type: 'docs' }] },
      { id: 's2', title: 'Регистрация по месту жительства', x: 300, y: 100, timeHours: 1, description: 'Оформление прописки или временной регистрации.', resources: [{ title: 'Госуслуги - регистрация', url: 'https://www.gosuslugi.ru/12677', type: 'docs' }] },
      { id: 's3', title: 'Открытие банковского счета', x: 500, y: 100, timeHours: 1, description: 'Получение социальной карты для выплат.', resources: [{ title: 'Социальная карта МИР', url: 'https://www.mir.ru', type: 'docs' }] },
      { id: 's4', title: 'Постановка на учет в ЦЗН', x: 200, y: 250, timeHours: 2, description: 'Регистрация в центре занятости для получения пособия.', resources: [{ title: 'Работа в России', url: 'https://trudvsem.ru', type: 'docs' }, { title: 'Пособие по безработице', url: 'https://www.gosuslugi.ru/15345', type: 'docs' }] },
      { id: 's5', title: 'Получение подъемных выплат', x: 400, y: 250, timeHours: 1, description: 'Единовременное пособие при выпуске.', resources: [{ title: 'Социальное казначейство', url: 'https://sotskaz.ru', type: 'docs' }] },
      { id: 's6', title: 'Получение жилья', x: 300, y: 400, timeHours: 3, description: 'Постановка в очередь на специализированное жилье.', resources: [{ title: 'Наш дом РФ', url: 'https://domrf.ru', type: 'docs' }] }
    ],
    edges: [
      { id: 'e1', from: 's1', to: 's2' }, { id: 'e2', from: 's2', to: 's3' },
      { id: 'e3', from: 's1', to: 's4' }, { id: 'e4', from: 's3', to: 's5' },
      { id: 'e5', from: 's4', to: 's5' }, { id: 'e6', from: 's5', to: 's6' }
    ]
  },
  {
    id: 'social-finance',
    title: 'Базовая финансовая защита',
    description: 'Умение управлять деньгами и не попасть в долговую яму.',
    nodes: [
      { id: 'f1', title: 'Бюджет и учет расходов', x: 100, y: 100, timeHours: 2, description: 'Планирование доходов и расходов, ведение учета.', resources: [{ title: 'Финансовая культура ЦБ РФ', url: 'https://fincult.info', type: 'course' }, { title: 'Приложение для учета бюджета', url: 'https://www.gosuslugi.ru', type: 'tool' }] },
      { id: 'f2', title: 'Налоги и вычеты', x: 300, y: 100, timeHours: 2, description: 'Базовые понятия НДФЛ, как получить вычет.', resources: [{ title: 'ФНС - личные налоги', url: 'https://www.nalog.gov.ru', type: 'docs' }, { title: 'Налоговый вычет', url: 'https://www.gosuslugi.ru/10010', type: 'docs' }] },
      { id: 'f3', title: 'Безопасность банковских карт', x: 500, y: 100, timeHours: 1, description: 'Защита от мошенников, безопасное использование карт.', resources: [{ title: 'Банк России - безопасность', url: 'https://cbr.ru', type: 'article' }] },
      { id: 'f4', title: 'Кредитная история', x: 200, y: 250, timeHours: 2, description: 'Как проверить и не испортить кредитную историю.', resources: [{ title: 'БКИ - кредитная история', url: 'https://www.gosuslugi.ru', type: 'docs' }] },
      { id: 'f5', title: 'Государственная поддержка', x: 400, y: 250, timeHours: 2, description: 'Субсидии, льготы и социальные выплаты.', resources: [{ title: 'Социальное казначейство', url: 'https://sotskaz.ru', type: 'docs' }, { title: 'Госуслуги - льготы', url: 'https://www.gosuslugi.ru', type: 'docs' }] }
    ],
    edges: [
      { id: 'e1', from: 'f1', to: 'f2' }, { id: 'e2', from: 'f2', to: 'f3' },
      { id: 'e3', from: 'f1', to: 'f4' }, { id: 'e4', from: 'f3', to: 'f5' },
      { id: 'e5', from: 'f4', to: 'f5' }
    ]
  },
  {
    id: 'social-profession',
    title: 'Поиск профессии',
    description: 'Выбор пути и первые шаги в карьере.',
    nodes: [
      { id: 'p1', title: 'Профориентация', x: 100, y: 100, timeHours: 3, description: 'Тесты на профориентацию, анализ интересов и способностей.', resources: [{ title: 'Атлас профессий', url: 'https://atlas100.ru', type: 'tool' }, { title: 'Билет в будущее', url: 'https://bilet.worldskills.ru', type: 'course' }] },
      { id: 'p2', title: 'Обучение и курсы', x: 300, y: 100, timeHours: 4, description: 'Бесплатные курсы, колледжи, программы наставничества.', resources: [{ title: 'Универсарium', url: 'https://universarium.org', type: 'course' }, { title: 'Открытое образование', url: 'https://openedu.ru', type: 'course' }] },
      { id: 'p3', title: 'Составление резюме', x: 500, y: 100, timeHours: 2, description: 'Как составить первое резюме без опыта работы.', resources: [{ title: 'Хабр Карьера', url: 'https://career.habr.com', type: 'article' }, { title: 'SuperJob - советы', url: 'https://www.superjob.ru', type: 'article' }] },
      { id: 'p4', title: 'Подготовка к собеседованию', x: 200, y: 250, timeHours: 2, description: 'Как проходить интервью, какие вопросы задают.', resources: [{ title: 'HeadHunter - советы', url: 'https://hh.ru', type: 'article' }] },
      { id: 'p5', title: 'Трудовой договор', x: 400, y: 250, timeHours: 2, description: 'Чтение и понимание трудового договора, права работника.', resources: [{ title: 'Трудовой кодекс РФ', url: 'http://www.kremlin.ru', type: 'docs' }, { title: 'Трудовая инспекция', url: 'https://www.rostrud.ru', type: 'docs' }] }
    ],
    edges: [
      { id: 'e1', from: 'p1', to: 'p2' }, { id: 'e2', from: 'p2', to: 'p3' },
      { id: 'e3', from: 'p1', to: 'p4' }, { id: 'e4', from: 'p3', to: 'p5' },
      { id: 'e5', from: 'p4', to: 'p5' }
    ]
  },
  {
    id: 'social-legal',
    title: 'Основы права',
    description: 'Знание своих прав и взаимодействие с госорганами.',
    nodes: [
      { id: 'l1', title: 'Права несовершеннолетних', x: 100, y: 100, timeHours: 2, description: 'Основные права детей и подростков по закону.', resources: [{ title: 'Уполномоченный по правам ребенка', url: 'https://deti.gov.ru', type: 'docs' }] },
      { id: 'l2', title: 'Ответственность', x: 300, y: 100, timeHours: 2, description: 'Уголовная и административная ответственность.', resources: [{ title: 'Правовая информация', url: 'http://www.pravo.gov.ru', type: 'docs' }] },
      { id: 'l3', title: 'Взаимодействие с полицией', x: 500, y: 100, timeHours: 2, description: 'Как вести себя при обращении в полицию, права при задержании.', resources: [{ title: 'МВД России', url: 'https://мвд.рф', type: 'docs' }] },
      { id: 'l4', title: 'Бесплатная юридическая помощь', x: 300, y: 250, timeHours: 2, description: 'Где получить бесплатного адвоката, юридические клиники.', resources: [{ title: 'Государственная юридическая помощь', url: 'https://www.gosuslugi.ru', type: 'docs' }] }
    ],
    edges: [
      { id: 'e1', from: 'l1', to: 'l2' }, { id: 'e2', from: 'l2', to: 'l3' },
      { id: 'e3', from: 'l1', to: 'l4' }, { id: 'e4', from: 'l3', to: 'l4' }
    ]
  },
  {
    id: 'social-crisis',
    title: 'Экстренная помощь',
    description: 'Алгоритмы действий в критических ситуациях. Куда звонить и идти.',
    nodes: [
      { id: 'c1', title: 'Телефоны доверия', x: 100, y: 100, timeHours: 0.5, description: 'Бесплатная анонимная психологическая помощь.', resources: [{ title: 'Общероссийский телефон доверия 8-800-2000-122', url: 'https://telefon-doveria.ru', type: 'docs' }] },
      { id: 'c2', title: 'Медицина без полиса', x: 300, y: 100, timeHours: 0.5, description: 'Правила получения экстренной помощи.', resources: [{ title: 'ФЗ Об ОМС', url: 'http://www.kremlin.ru', type: 'docs' }] },
      { id: 'c3', title: 'Задержание полицией', x: 500, y: 100, timeHours: 1, description: 'Права несовершеннолетнего при опросе.', resources: [{ title: 'Уполномоченный по правам ребенка', url: 'https://deti.gov.ru', type: 'docs' }] },
      { id: 'c4', title: 'Ночлег и питание', x: 200, y: 250, timeHours: 1, description: 'Куда обратиться ночью, если некуда идти.', resources: [{ title: 'Ночлежка', url: 'https://nightlezhka.ru', type: 'docs' }] },
      { id: 'c5', title: 'Юридическая защита', x: 400, y: 250, timeHours: 1, description: 'Бесплатные юристы для сирот и подростков.', resources: [{ title: 'Правовая помощь', url: 'https://www.gosuslugi.ru', type: 'docs' }] }
    ],
    edges: [
      { id: 'e1', from: 'c1', to: 'c2' }, { id: 'e2', from: 'c2', to: 'c3' },
      { id: 'e3', from: 'c1', to: 'c4' }, { id: 'e4', from: 'c3', to: 'c5' },
      { id: 'e5', from: 'c4', to: 'c5' }
    ]
  }
];