# Mapa de Funcionalidades

> Índice mantido junto ao código de cada funcionalidade visível ao usuário. Atualizado junto com o código — não depois.

## Login

O usuário informa e-mail e senha para autenticar. Com sucesso, um JWT é armazenado e o usuário é redirecionado ao dashboard.

**Fluxo:**

1. `src/core/router/index.tsx` — rota `/login` renderiza LoginPage fora do ProtectedRoute
2. `src/modules/auth/LoginPage.tsx` — valida o formulário com Zod; chama httpRequest no submit
3. `src/core/http/request.helper.ts` — encapsula a chamada Axios e normaliza erros
4. `src/core/http/api.ts` — instância Axios configurada; armazena token no localStorage em 200; redireciona para /login em 401
5. `src/modules/auth/LoginPage.tsx` — salva `atlas-token` no localStorage e navega para `/`

---

## Proteção de Rotas

Usuários não autenticados são redirecionados ao login; usuários autenticados acessam o shell principal.

**Fluxo:**

1. `src/core/router/index.tsx` — envolve todas as rotas autenticadas no elemento ProtectedRoute
2. `src/shared/components/router/ProtectedRoute.tsx` — verifica `atlas-token` no localStorage; redireciona para /login se ausente, caso contrário renderiza o Outlet
3. `src/shared/components/layouts/MainLayout.tsx` — renderiza SideBar + AppHeader + Outlet da página para sessões autenticadas

---

## Navegação (Sidebar)

O usuário navega entre os módulos pela sidebar.

**Fluxo:**

1. `src/shared/components/layouts/SideBar.tsx` — renderiza itens NavLink para dashboard, empresas, indicação, segmentação e turismo; destaca a rota ativa
2. `src/core/router/index.tsx` — árvore de rotas mapeia cada caminho ao componente de página do módulo

---

## Alternância de Tema (Claro / Escuro)

O usuário alterna entre modo claro e escuro pelo header.

**Fluxo:**

1. `src/shared/components/layouts/AppHeader.tsx` — botão Sol/Lua chama toggleTheme
2. `src/core/store/theme.store.ts` — persiste a escolha no localStorage; aplica/remove a classe `dark` no `<html>`

---

## Troca de Idioma

O usuário seleciona um idioma (pt-BR, en-US, es-ES) pelos botões de bandeira no header.

**Fluxo:**

1. `src/shared/components/layouts/AppHeader.tsx` — botão de bandeira chama setLanguage
2. `src/core/store/language.store.ts` — persiste o locale no localStorage; chama i18n.changeLanguage
3. `src/core/i18n/index.ts` — instância i18next re-renderiza todas as chamadas t() no idioma ativo
4. `src/mock/languages/` — arquivos JSON de tradução com strings para os três locales

---

## Logout

O usuário sai da sessão pelo menu do avatar no header.

**Fluxo:**

1. `src/shared/components/layouts/AppHeader.tsx` — botão de logout chama handleLogout
2. `src/shared/components/layouts/AppHeader.tsx` — remove `atlas-token` do localStorage e navega para `/login` via window.location.href

---

## Visão Geral do Dashboard

O usuário autenticado acessa o dashboard e visualiza contagens de indicações e nomes recentes.

**Fluxo:**

1. `src/core/router/index.tsx` — rota index renderiza DashboardPage
2. `src/modules/dashboard/DashboardPage.tsx` — renderiza cards de estatísticas usando useDashboardStats; outros cards exibem valores estáticos mockados
3. `src/modules/dashboard/hooks/useDashboardStats.ts` — busca a primeira página de indicações no serviço
4. `src/modules/indication/services/indication.service.ts` — GET /geographical-indications; mapeia resposta para IndicationRow
5. `src/core/http/request.helper.ts` — executa a chamada HTTP via instância Axios

---

## Listagem de Indicações Geográficas

O usuário navega, busca, filtra e pagina a lista de indicações geográficas.

**Fluxo:**

1. `src/core/router/index.tsx` — rota `/indicacao-geografica` renderiza IndicationListingPage
2. `src/modules/indication/IndicationListingPage.tsx` — renderiza ListingTable; delega dados/estado ao useIndications
3. `src/modules/indication/hooks/useIndication.ts` — conecta useListing com fetchIndications; define colunas da tabela
4. `src/shared/hooks/useListing.ts` — gerencia estado de página/busca, AbortController e reload
5. `src/modules/indication/services/indication.service.ts` — GET /geographical-indications com parâmetros page/per_page/search
6. `src/core/http/request.helper.ts` — executa a chamada HTTP via instância Axios
7. `src/shared/components/base/ListingTable.tsx` — renderiza TanStack Table com campo de busca e controles de paginação
8. `src/shared/components/base/SearchBar.tsx` — input de busca com dropdown de sugestões configurável; dispara fetch apenas no submit explícito pelo botão
9. `src/shared/components/base/FilterSheet.tsx` — Sheet lateral com grupos de filtros; o usuário configura e aplica os filtros
10. `src/shared/components/base/ActiveFilters.tsx` — renderiza chips de filtros ativos abaixo do header da tabela; permite remover filtros individualmente

---

## Criar Indicação Geográfica

O usuário abre um dialog na listagem, preenche o formulário e envia para criar uma nova indicação.

**Fluxo:**

1. `src/modules/indication/IndicationListingPage.tsx` — botão "Novo Registro" chama openForm do useIndicationCreate
2. `src/modules/indication/hooks/useIndicationCreate.ts` — gerencia estado de abertura do formulário e handleSubmit
3. `src/shared/components/base/FormDialog.tsx` — envolve IndicationCreateForm em um modal dialog
4. `src/modules/indication/components/IndicationCreateForm.tsx` — formulário com validação Zod; busca opções de cidade/organização via useIndicationFormOptions
5. `src/modules/indication/hooks/useIndicationFormOptions.ts` — GET /cities e GET /organizations em paralelo para opções de select
6. `src/modules/indication/hooks/useIndicationCreate.ts` — handleSubmit chama createIndication, exibe toast e chama reload
7. `src/modules/indication/services/indication.service.ts` — POST /geographical-indications
8. `src/core/http/request.helper.ts` — executa a chamada HTTP via instância Axios

---

## Excluir Indicação Geográfica

O usuário clica no ícone de exclusão em uma linha da listagem e confirma para remover a indicação.

**Fluxo:**

1. `src/modules/indication/IndicationListingPage.tsx` — ícone de exclusão chama promptDelete do useIndications
2. `src/modules/indication/hooks/useIndication.ts` — define itemToDelete e abre o ConfirmDialog
3. `src/shared/components/base/ConfirmDialog.tsx` — usuário confirma; chama executeDelete
4. `src/modules/indication/hooks/useIndication.ts` — executeDelete chama deleteIndication, depois reload e toast
5. `src/modules/indication/services/indication.service.ts` — DELETE /geographical-indications/:id
6. `src/core/http/request.helper.ts` — executa a chamada HTTP via instância Axios

---

## Detalhe de Indicação Geográfica

O usuário clica no nome da linha ou no ícone de detalhe para abrir um Sheet lateral com os dados completos da indicação, sem sair da página de listagem.

**Fluxo:**

1. `src/modules/indication/IndicationListingPage.tsx` — clicar no nome da linha ou no ícone FileSearch chama `setSelectedId(row.id)`
2. `src/modules/indication/IndicationListingPage.tsx` — `selectedId !== null` renderiza `IndicationDetailSheet` com `open={true}` e `id={selectedId}`
3. `src/modules/indication/IndicationDetailSheet.tsx` — Sheet lateral que recebe a prop `id`; chama useIndicationDetail para buscar os dados
4. `src/modules/indication/hooks/useIndicationDetail.ts` — busca uma indicação pelo ID; usa AbortController
5. `src/modules/indication/services/indication.service.ts` — GET /geographical-indications/:id
6. `src/core/http/request.helper.ts` — executa a chamada HTTP via instância Axios
7. `src/modules/indication/IndicationDetailSheet.tsx` — renderiza IndicationMainContainer, IndicationLocationContainer, IndicationOrganizationContainer e IndicationAuditContainer dentro do Sheet; não existe rota separada

---

## Editar Indicação Geográfica

O usuário clica em Editar em uma seção do Sheet de detalhe, atualiza os campos no dialog e salva.

**Fluxo:**

1. `src/modules/indication/IndicationDetailSheet.tsx` — cada container de seção (Main, Location, Organization) tem um botão Editar que chama `openForm(data, section)` do useIndicationEdit
2. `src/modules/indication/hooks/useIndicationEdit.ts` — armazena editTarget e editSection, gerencia estado de abertura do formulário e handleSubmit
3. `src/shared/components/base/FormDialog.tsx` — envolve IndicationEditForm em um modal dialog renderizado dentro do Sheet
4. `src/modules/indication/components/IndicationEditForm.tsx` — formulário pré-preenchido com validação Zod; recebe a prop section para exibir os campos relevantes; busca opções via useIndicationFormOptions
5. `src/modules/indication/hooks/useIndicationFormOptions.ts` — GET /cities e GET /organizations em paralelo
6. `src/modules/indication/hooks/useIndicationEdit.ts` — handleSubmit chama updateIndication, exibe toast e chama reload
7. `src/modules/indication/services/indication.service.ts` — PUT /geographical-indications/:id
8. `src/core/http/request.helper.ts` — executa a chamada HTTP via instância Axios

---

## Branding Dinâmico

O usuário acessa `/configuracoes` e configura 10 variáveis de cor CSS. As alterações são persistidas no localStorage e aplicadas imediatamente ao root do documento.

**Fluxo:**

1. `src/shared/components/layouts/SideBar.tsx` — link para `/configuracoes` na navegação
2. `src/core/router/index.tsx` — rota `/configuracoes` renderiza BrandingConfigPage
3. `src/modules/branding/BrandingConfigPage.tsx` — formulário com 10 seletores de cor (primary, background, card, border, secondary, foreground, mutedForeground, destructive, success, warning, info); Salvar aplica e persiste; Redefinir restaura DEFAULT_CONFIG
4. `src/modules/branding/branding.store.ts` — Zustand store; persiste na chave `app-branding` do localStorage; injeta variáveis CSS no carregamento via `document.documentElement.style.setProperty`

---

## Empresas (Planejado)

Página placeholder em `/empresas`. Nenhuma funcionalidade implementada.

**Fluxo:**

1. `src/core/router/index.tsx` — rota `/empresas` renderiza CompaniesPage
2. `src/modules/companies/CompaniesPage.tsx` — renderiza o componente UnderConstruction

---

## Segmentação de Loja (Planejado)

Página placeholder em `/segmentacao-de-loja`. Nenhuma funcionalidade implementada.

**Fluxo:**

1. `src/core/router/index.tsx` — rota `/segmentacao-de-loja` renderiza SegmentationPage
2. `src/modules/segmentation/SegmentationPage.tsx` — renderiza o componente UnderConstruction

---

## Turismo (Planejado)

Página placeholder em `/turismo`. Nenhuma funcionalidade implementada.

**Fluxo:**

1. `src/core/router/index.tsx` — rota `/turismo` renderiza TourismPage
2. `src/modules/tourism/TourismPage.tsx` — renderiza o componente UnderConstruction

---
