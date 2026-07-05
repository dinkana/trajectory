import type { SkillTree } from '@/types';

export const aiDataTrees: SkillTree[] = [
  {
    id: 'preset-data-engineering',
    title: 'Data Engineering',
    description: 'Построение надежных потоков данных.',
    nodes: [
      { id: 'de-1', title: 'Advanced SQL', x: 100, y: 100, timeHours: 8, cheatsheet: 'Window Functions, CTE, Star Schema.' },
      { id: 'de-2', title: 'Python for Data', x: 300, y: 100, timeHours: 6, cheatsheet: 'Pandas / Polars, Векторизация.' },
      { id: 'de-3', title: 'ETL Pipelines', x: 500, y: 100, timeHours: 10, cheatsheet: 'Extract, Transform, Load, DAG.' },
      { id: 'de-4', title: 'Big Data (Spark)', x: 200, y: 250, timeHours: 12, cheatsheet: 'RDD, DataFrame, Partitioning, Shuffle.' },
      { id: 'de-5', title: 'Warehouses', x: 400, y: 250, timeHours: 8, cheatsheet: 'Columnar storage, Time Travel.' },
      { id: 'de-6', title: 'Data Quality', x: 300, y: 400, timeHours: 6, cheatsheet: 'dbt, Data Contracts, Testing.' }
    ],
    edges: [
      { id: 'e1', from: 'de-1', to: 'de-2' }, { id: 'e2', from: 'de-2', to: 'de-3' },
      { id: 'e3', from: 'de-1', to: 'de-4' }, { id: 'e4', from: 'de-3', to: 'de-5' },
      { id: 'e5', from: 'de-4', to: 'de-5' }, { id: 'e6', from: 'de-5', to: 'de-6' }
    ]
  },
  {
    id: 'preset-ml-engineer',
    title: 'Machine Learning Engineer',
    description: 'От классического ML до глубокого обучения.',
    nodes: [
      { id: 'ml-1', title: 'Math for ML', x: 100, y: 100, timeHours: 15, cheatsheet: 'LinAlg, Calculus, Stats.' },
      { id: 'ml-2', title: 'Classical ML', x: 300, y: 100, timeHours: 10, cheatsheet: 'Regression, Trees, SVM, Metrics.' },
      { id: 'ml-3', title: 'Feature Eng', x: 500, y: 100, timeHours: 8, cheatsheet: 'Imputation, Encoding, Scaling.' },
      { id: 'ml-4', title: 'Deep Learning', x: 200, y: 250, timeHours: 12, cheatsheet: 'Tensors, Autograd, nn.Module.' },
      { id: 'ml-5', title: 'NLP & CV', x: 400, y: 250, timeHours: 10, cheatsheet: 'Transformers, CNNs, Transfer Learning.' },
      { id: 'ml-6', title: 'MLOps', x: 300, y: 400, timeHours: 8, cheatsheet: 'Registry, Serving, Drift Monitoring.' }
    ],
    edges: [
      { id: 'e1', from: 'ml-1', to: 'ml-2' }, { id: 'e2', from: 'ml-2', to: 'ml-3' },
      { id: 'e3', from: 'ml-1', to: 'ml-4' }, { id: 'e4', from: 'ml-3', to: 'ml-5' },
      { id: 'e5', from: 'ml-4', to: 'ml-5' }, { id: 'e6', from: 'ml-5', to: 'ml-6' }
    ]
  },
  {
    id: 'preset-ai-prompt',
    title: 'AI Integration & Prompt Eng',
    description: 'Работа с LLM, RAG и AI-агентами.',
    nodes: [
      { id: 'ai-1', title: 'LLM API', x: 100, y: 100, timeHours: 4, cheatsheet: 'Tokens, Temperature, System Prompt.' },
      { id: 'ai-2', title: 'Prompting', x: 300, y: 100, timeHours: 6, cheatsheet: 'Zero-shot, CoT, Role-playing.' },
      { id: 'ai-3', title: 'Embeddings & Vector DB', x: 500, y: 100, timeHours: 8, cheatsheet: 'Vectors, Cosine Similarity, Pinecone/Chroma.' },
      { id: 'ai-4', title: 'RAG', x: 200, y: 250, timeHours: 10, cheatsheet: 'Chunking, Embedding, Retrieval, Generation.' },
      { id: 'ai-5', title: 'Frameworks', x: 400, y: 250, timeHours: 8, cheatsheet: 'Chains, Agents, Tools.' },
      { id: 'ai-6', title: 'AI Agents', x: 300, y: 400, timeHours: 6, cheatsheet: 'Multi-agent, Evaluation (RAGAS).' }
    ],
    edges: [
      { id: 'e1', from: 'ai-1', to: 'ai-2' }, { id: 'e2', from: 'ai-2', to: 'ai-3' },
      { id: 'e3', from: 'ai-1', to: 'ai-4' }, { id: 'e4', from: 'ai-3', to: 'ai-5' },
      { id: 'e5', from: 'ai-4', to: 'ai-5' }, { id: 'e6', from: 'ai-5', to: 'ai-6' }
    ]
  }
];