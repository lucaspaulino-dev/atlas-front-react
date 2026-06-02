# Feature Map

> Auto-maintained index of every user-facing feature and the code path that implements it. Updated alongside the code — not after the fact.

## Login

User enters email and password to authenticate. On success a JWT is stored and the user is redirected to the dashboard.

**Flow:**

1. `src/core/router/index.tsx` — `/login` route renders LoginPage outside the ProtectedRoute
2. `src/modules/auth/LoginPage.tsx` — validates form with Zod; calls httpRequest on submit
3. `src/core/http/request.helper.ts` — wraps Axios call, normalises errors
4. `src/core/http/api.ts` — configured Axios instance; stores token to localStorage on 200; redirects to /login on 401
5. `src/modules/auth/LoginPage.tsx` — stores `atlas-token` in localStorage and navigates to `/`

---

## Route Protection

Unauthenticated users are redirected to the login page; authenticated users access the main shell.

**Flow:**

1. `src/core/router/index.tsx` — wraps all authenticated routes in the ProtectedRoute element
2. `src/shared/components/router/ProtectedRoute.tsx` — checks `atlas-token` in localStorage; redirects to /login if absent, otherwise renders Outlet
3. `src/shared/components/layouts/MainLayout.tsx` — renders SideBar + AppHeader + page Outlet for authenticated sessions

---

## Navigation (Sidebar)

User navigates between modules using the sidebar.

**Flow:**

1. `src/shared/components/layouts/SideBar.tsx` — renders NavLink items for dashboard, companies, indication, segmentation, tourism routes; highlights active route
2. `src/core/router/index.tsx` — route tree maps each path to its module page component

---

## Theme Toggle (Light / Dark)

User switches between light and dark mode from the header.

**Flow:**

1. `src/shared/components/layouts/AppHeader.tsx` — Sun/Moon button calls toggleTheme
2. `src/core/store/theme.store.ts` — persists choice to localStorage; applies/removes `dark` class on `<html>`

---

## Language Switch

User selects a language (pt-BR, en-US, es-ES) from flag buttons in the header.

**Flow:**

1. `src/shared/components/layouts/AppHeader.tsx` — flag button calls setLanguage
2. `src/core/store/language.store.ts` — persists locale to localStorage; calls i18n.changeLanguage
3. `src/core/i18n/index.ts` — i18next instance re-renders all t() calls in the active language
4. `src/mock/languages/` — JSON translation files providing strings for all three locales

---

## Logout

User logs out from the avatar dropdown in the header.

**Flow:**

1. `src/shared/components/layouts/AppHeader.tsx` — logout button calls handleLogout
2. `src/shared/components/layouts/AppHeader.tsx` — removes `atlas-token` from localStorage and navigates to `/login` via window.location.href

---

## Dashboard Overview

Authenticated user lands on the dashboard and sees indication counts and recent names.

**Flow:**

1. `src/core/router/index.tsx` — index route renders DashboardPage
2. `src/modules/dashboard/DashboardPage.tsx` — renders stat cards using useDashboardStats; other cards show static mock values
3. `src/modules/dashboard/useDashboardStats.ts` — fetches first page of indications from the service
4. `src/modules/indication/services/indication.service.ts` — GET /geographical-indications; maps response to IndicationRow
5. `src/core/http/request.helper.ts` — executes the HTTP call via the Axios instance

---

## Geographical Indication Listing

User browses, searches, filters, and paginates the list of geographical indications.

**Flow:**

1. `src/core/router/index.tsx` — `/indicacao-geografica` route renders IndicationListingPage
2. `src/modules/indication/IndicationListingPage.tsx` — renders ListingTable; delegates data/state to useIndications
3. `src/modules/indication/hooks/useIndication.ts` — wires useListing with fetchIndications; defines table columns
4. `src/shared/hooks/useListing.ts` — manages page/search state, AbortController, and reload
5. `src/modules/indication/services/indication.service.ts` — GET /geographical-indications with page/per_page/search params
6. `src/core/http/request.helper.ts` — executes the HTTP call via the Axios instance
7. `src/shared/components/base/ListingTable.tsx` — renders TanStack Table with search input and pagination controls
8. `src/shared/components/base/SearchBar.tsx` — search input with configurable suggestion dropdown; triggers fetch only on explicit button submit
9. `src/shared/components/base/FilterSheet.tsx` — lateral Sheet with filter groups; user configures and applies filters
10. `src/shared/components/base/ActiveFilters.tsx` — renders active filter chips below the table header; allows removing individual filters

---

## Create Geographical Indication

User opens a dialog from the listing, fills in the form, and submits to create a new indication.

**Flow:**

1. `src/modules/indication/IndicationListingPage.tsx` — "New Record" button calls openForm from useIndicationCreate
2. `src/modules/indication/hooks/useIndicationCreate.ts` — manages form open state and handleSubmit
3. `src/shared/components/base/FormDialog.tsx` — wraps IndicationCreateForm in a modal dialog
4. `src/modules/indication/components/IndicationCreateForm.tsx` — form with Zod validation; fetches city/org options via useIndicationFormOptions
5. `src/modules/indication/hooks/useIndicationFormOptions.ts` — parallel GET /cities and GET /organizations for select options
6. `src/modules/indication/hooks/useIndicationCreate.ts` — handleSubmit calls createIndication then shows toast and calls reload
7. `src/modules/indication/services/indication.service.ts` — POST /geographical-indications
8. `src/core/http/request.helper.ts` — executes the HTTP call via the Axios instance

---

## Delete Geographical Indication

User clicks the delete icon on a listing row and confirms to remove the indication.

**Flow:**

1. `src/modules/indication/IndicationListingPage.tsx` — delete icon calls promptDelete from useIndications
2. `src/modules/indication/hooks/useIndication.ts` — sets itemToDelete and opens ConfirmDialog
3. `src/shared/components/base/ConfirmDialog.tsx` — user confirms; calls executeDelete
4. `src/modules/indication/hooks/useIndication.ts` — executeDelete calls deleteIndication, then reload and toast
5. `src/modules/indication/services/indication.service.ts` — DELETE /geographical-indications/:id
6. `src/core/http/request.helper.ts` — executes the HTTP call via the Axios instance

---

## Geographical Indication Detail View

User clicks a row name or the detail icon to open a lateral Sheet with the full detail of the indication, without leaving the listing page.

**Flow:**

1. `src/modules/indication/IndicationListingPage.tsx` — clicking the row name or the FileSearch icon calls `setSelectedId(row.id)`
2. `src/modules/indication/IndicationListingPage.tsx` — `selectedId !== null` renders `IndicationDetailSheet` with `open={true}` and `id={selectedId}`
3. `src/modules/indication/IndicationDetailSheet.tsx` — Sheet lateral that receives the `id` prop; calls useIndicationDetail to fetch the indication data
4. `src/modules/indication/hooks/useIndicationDetail.ts` — fetches single indication; uses AbortController
5. `src/modules/indication/services/indication.service.ts` — GET /geographical-indications/:id
6. `src/core/http/request.helper.ts` — executes the HTTP call via the Axios instance
7. `src/modules/indication/IndicationDetailSheet.tsx` — renders IndicationMainContainer, IndicationLocationContainer, IndicationOrganizationContainer, IndicationAuditContainer inside the Sheet; no separate route exists

---

## Edit Geographical Indication

User clicks Edit on a section inside the detail Sheet, updates fields in the dialog, and saves.

**Flow:**

1. `src/modules/indication/IndicationDetailSheet.tsx` — each section container (Main, Location, Organization) has an Edit button that calls `openForm(data, section)` from useIndicationEdit
2. `src/modules/indication/hooks/useIndicationEdit.ts` — stores editTarget and editSection, manages form open state and handleSubmit
3. `src/shared/components/base/FormDialog.tsx` — wraps IndicationEditForm in a modal dialog rendered inside the Sheet
4. `src/modules/indication/components/IndicationEditForm.tsx` — pre-populated form with Zod validation; receives section prop to show relevant fields; fetches city/org options via useIndicationFormOptions
5. `src/modules/indication/hooks/useIndicationFormOptions.ts` — parallel GET /cities and GET /organizations
6. `src/modules/indication/hooks/useIndicationEdit.ts` — handleSubmit calls updateIndication then shows toast and calls reload
7. `src/modules/indication/services/indication.service.ts` — PUT /geographical-indications/:id
8. `src/core/http/request.helper.ts` — executes the HTTP call via the Axios instance

---

## Dynamic Branding

User accesses `/configuracoes` and configures 10 CSS color variables. Changes are persisted in localStorage and applied immediately to the document root.

**Flow:**

1. `src/shared/components/layouts/SideBar.tsx` — link to `/configuracoes` in navigation
2. `src/core/router/index.tsx` — `/configuracoes` route renders BrandingConfigPage
3. `src/modules/branding/BrandingConfigPage.tsx` — form with 10 color pickers (primary, background, card, border, secondary, foreground, mutedForeground, destructive, success, warning, info); Save applies and persists; Reset restores DEFAULT_CONFIG
4. `src/modules/branding/branding.store.ts` — Zustand store; persists to localStorage key `app-branding`; injects CSS vars on load via `document.documentElement.style.setProperty`

---

## Companies (Planned)

Placeholder page at `/empresas`. No feature implemented.

**Flow:**

1. `src/core/router/index.tsx` — `/empresas` route renders CompaniesPage
2. `src/modules/companies/CompaniesPage.tsx` — renders UnderConstruction component

---

## Store Segmentation (Planned)

Placeholder page at `/segmentacao-de-loja`. No feature implemented.

**Flow:**

1. `src/core/router/index.tsx` — `/segmentacao-de-loja` route renders SegmentationPage
2. `src/modules/segmentation/SegmentationPage.tsx` — renders UnderConstruction component

---

## Tourism (Planned)

Placeholder page at `/turismo`. No feature implemented.

**Flow:**

1. `src/core/router/index.tsx` — `/turismo` route renders TourismPage
2. `src/modules/tourism/TourismPage.tsx` — renders UnderConstruction component

---
