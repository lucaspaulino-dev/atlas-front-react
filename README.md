# Atlas Territorial do Turismo — Frontend

Interface web do sistema Atlas, construída em React + TypeScript + Vite.

## Pré-requisitos

- Node.js 20+
- npm 10+

## Início rápido

```bash
npm install
cp .env.example .env   # edite VITE_API_URL se necessário
npm run dev            # http://localhost:5173
```

## Scaffolder — criar novo módulo

```bash
npm run atlas -- create module <nome>
```

Gera os 14 arquivos de boilerplate de um módulo CRUD completo (incluindo `.context.md`) e registra a rota e as traduções automaticamente.

## Documentação

Toda a arquitetura, padrões de código e guia de onboarding estão em [`docs/GOVERNANCE.md`](docs/GOVERNANCE.md).

O módulo de referência (padrão canônico) é `src/modules/indication/`.

## Comandos

| Comando          | O que faz                           |
| ---------------- | ----------------------------------- |
| `npm run dev`    | Servidor de desenvolvimento com HMR |
| `npm run build`  | Build de produção em `dist/`        |
| `npm run lint`   | ESLint em todo o projeto            |
| `npm run format` | Prettier — formata o código         |
