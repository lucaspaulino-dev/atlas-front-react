# Atlas Front

Frontend da aplicação Atlas, desenvolvido com React, TypeScript e Vite.

## Tecnologias

- **React 19** com StrictMode
- **TypeScript**
- **Vite** (bundler)
- **Tailwind CSS** + **shadcn/ui** (componentes)
- **React Router DOM** (rotas)
- **TanStack Table** (tabelas)
- **React Hook Form** + **Zod** (formulários e validação)
- **Zustand** (estado global)
- **Axios** (requisições HTTP)
- **i18next** (internacionalização)

## Pré-requisitos

- Node.js 18+
- npm

## Instalação

```bash
npm install
```

## Scripts

| Comando           | Descrição                            |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Inicia o servidor de desenvolvimento |
| `npm run build`   | Gera o build de produção             |
| `npm run preview` | Visualiza o build localmente         |
| `npm run lint`    | Executa o ESLint                     |
| `npm run format`  | Formata o código com Prettier        |

## Estrutura do projeto

```
src/
├── core/
│   ├── http/        # Configuração do Axios e helpers de requisição
│   ├── i18n/        # Configuração do i18next
│   ├── router/      # Definição de rotas
│   └── store/       # Stores globais (tema, idioma)
├── modules/
│   ├── auth/
│   ├── branding/    # Configurações de branding dinâmico
│   ├── companies/
│   ├── dashboard/
│   ├── indication/  # CRUD completo com sheet de detalhe e filtros
│   ├── segmentation/
│   └── tourism/
└── shared/
    ├── components/
    │   ├── base/    # Componentes reutilizáveis (ListingTable, FormDialog, ConfirmDialog, SearchBar, FilterSheet, ActiveFilters)
    │   ├── layouts/ # Layout principal, header e sidebar
    │   └── ui/      # Componentes de UI (shadcn/ui)
    ├── helpers/
    └── hooks/
```

## Qualidade de código

O projeto usa **Husky** + **lint-staged** para garantir qualidade antes de cada commit:

- Arquivos `.ts/.tsx`: ESLint (fix) + Prettier
- Demais arquivos: Prettier

Os hooks são instalados automaticamente via `npm install` (`prepare: husky`).
