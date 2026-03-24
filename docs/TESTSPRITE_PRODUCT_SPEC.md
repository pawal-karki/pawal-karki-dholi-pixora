# TestSprite — Product Specification Document

**Version:** 1.0
**Date:** March 28, 2026
**Status:** Active

---

## 1. Product Overview

### 1.1 What Is TestSprite?

TestSprite is an AI-powered, hosted testing platform that integrates directly into the Cursor IDE via the Model Context Protocol (MCP). It automates the full testing lifecycle — from codebase analysis and test plan generation to test execution and interactive result review — without requiring developers to leave their editor.

### 1.2 Value Proposition

- **Zero-config test generation:** Analyzes a project's codebase to automatically produce comprehensive test plans for both frontend and backend code.
- **IDE-native workflow:** Operates as an MCP server inside Cursor, allowing developers to bootstrap, generate, execute, and review tests through natural-language tool invocations.
- **Interactive dashboard:** Provides a web-based UI for reviewing test results, editing individual test steps, and re-running tests from any point in the sequence.
- **Standardized documentation:** Auto-generates Product Requirement Documents (PRDs) and code summaries from source, bridging the gap between code and specification.

### 1.3 Target Users

| Persona | Use Case |
|---------|----------|
| **Individual developers** | Rapidly generate and run tests for personal or side projects without writing test boilerplate. |
| **Agency / team leads** | Produce standardized PRDs and test plans that align across multi-tenant SaaS products (e.g., Pixora). |
| **QA engineers** | Review, edit, and re-run generated tests through the interactive dashboard. |
| **CI/CD operators** | Integrate TestSprite-generated test suites into existing pipelines. |

---

## 2. Architecture & Integration Model

### 2.1 High-Level Architecture

```
┌──────────────────────────────────────────────────┐
│                    Cursor IDE                     │
│                                                   │
│  ┌───────────┐    MCP Protocol    ┌────────────┐ │
│  │  Developer │ ◄──────────────► │ TestSprite  │ │
│  │  (Chat /   │                   │ MCP Server  │ │
│  │   Agent)   │                   └──────┬─────┘ │
│  └───────────┘                           │       │
│                                          │       │
└──────────────────────────────────────────┼───────┘
                                           │
                              ┌────────────▼────────────┐
                              │   TestSprite Cloud API   │
                              │  ┌────────────────────┐  │
                              │  │ Code Analysis       │  │
                              │  │ Test Plan Engine     │  │
                              │  │ Test Code Generator  │  │
                              │  │ Execution Runtime    │  │
                              │  │ Dashboard Server     │  │
                              │  └────────────────────┘  │
                              └──────────────────────────┘
                                           │
                              ┌────────────▼────────────┐
                              │   Local Dev Environment  │
                              │  (App running on         │
                              │   localhost:PORT)        │
                              └──────────────────────────┘
```

### 2.2 Integration Points

| Layer | Mechanism |
|-------|-----------|
| **IDE** | Cursor MCP server (`user-TestSprite`). Eight tool descriptors are registered and invokable from the AI chat. |
| **Local filesystem** | TestSprite reads the project directory (source code, configs). A `.testsprite/config.json` file is created on bootstrap to persist session state. |
| **Local server** | Tests execute against the app running on a developer-specified port (e.g., `localhost:3000`). |
| **Cloud** | TestSprite's backend handles AI-driven code analysis, test generation, execution orchestration, and dashboard hosting. |

### 2.3 Session State

On bootstrap, TestSprite writes a local configuration file:

```json
{
  "status": "init",
  "scope": "codebase",
  "type": "backend",
  "localEndpoint": "http://localhost:3000/",
  "serverPort": 60114
}
```

| Field | Description |
|-------|-------------|
| `status` | Current session lifecycle state (e.g., `init`, `ready`, `running`). |
| `scope` | Test scope — `codebase` (full project) or `diff` (staged changes only). |
| `type` | Test type — `frontend` or `backend`. |
| `localEndpoint` | The URL of the locally running application under test. |
| `serverPort` | Internal port used by TestSprite's local helper service. |

---

## 3. Feature Catalog

### 3.1 Tool Reference (MCP Interface)

TestSprite exposes **eight tools** through the MCP protocol. Each tool is invoked by the Cursor AI agent or directly by the developer.

#### 3.1.1 `testsprite_bootstrap`

**Purpose:** First-time project initialization. Creates the `.testsprite/config.json` and registers the project with TestSprite's backend.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `localPort` | `number` (1–65535) | Yes | Port the local app is served on. Default: `5173`. |
| `pathname` | `string` | No | Webpage path (without domain). Defaults to `""`. |
| `type` | `enum` (`frontend` \| `backend`) | Yes | Whether to generate frontend or backend tests. |
| `projectPath` | `string` | Yes | Absolute path to the project root. |
| `testScope` | `enum` (`codebase` \| `diff`) | Yes | Scope of analysis — entire codebase or staged git diff. |

**Guard:** If `.testsprite/config.json` already exists, this tool must NOT be called. Proceed directly with other tools.

#### 3.1.2 `testsprite_generate_code_summary`

**Purpose:** Analyzes the project repository and produces a structured summary of the codebase — file tree, key modules, dependencies, and architectural patterns.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectRootPath` | `string` | Yes | Absolute path to the project root. |

#### 3.1.3 `testsprite_generate_standardized_prd`

**Purpose:** Generates a structured, standardized Product Requirement Document from the codebase. Useful for documentation, onboarding, and aligning test plans with requirements.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectPath` | `string` | Yes | Absolute path to the project root. |

#### 3.1.4 `testsprite_generate_frontend_test_plan`

**Purpose:** Generates a test plan specifically for frontend testing (UI interactions, page flows, visual regression).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectPath` | `string` | Yes | Absolute path to the project root. |
| `needLogin` | `boolean` | Yes | Whether to include login/authentication flows in the test plan. Default: `true`. |

#### 3.1.5 `testsprite_generate_backend_test_plan`

**Purpose:** Generates a test plan for backend testing (API endpoints, data flows, business logic).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectPath` | `string` | Yes | Absolute path to the project root. |

#### 3.1.6 `testsprite_generate_code_and_execute`

**Purpose:** Core execution tool. Generates test code from an existing test plan and runs it against the locally running application. Produces a markdown report of results.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectName` | `string` | Yes | Name of the root directory of the project. |
| `projectPath` | `string` | Yes | Absolute path to the project root. |
| `testIds` | `string[]` | Yes | Specific test IDs to execute. Empty array `[]` runs all tests. |
| `additionalInstruction` | `string` | Yes | Extra instructions for test generation. Empty string `""` if none. |
| `serverMode` | `enum` (`production` \| `development`) | Yes | How the local server was started. Default: `development`. |

**Server mode behavior:**

| Mode | Detection | Limits |
|------|-----------|--------|
| `production` | `npm run build && npm run start` (Next.js), `npm run build && npm run preview` (Vite) | Full test suite executed. |
| `development` | `npm run dev` or similar hot-reload server | Frontend tests capped at **15 high-priority tests** to prevent dev server overload. |

**Prerequisites:** The local project must be running. If a test plan has already been generated, this tool can be called directly without calling `testsprite_bootstrap` first.

#### 3.1.7 `testsprite_open_test_result_dashboard`

**Purpose:** Opens an interactive web dashboard for reviewing completed test results. Supports viewing execution status, editing individual test steps, and re-running tests from any step.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectPath` | `string` | Yes | Absolute path to the project root. |
| `modificationContext` | `string` | No | Context about test results or modifications to review. |

**Prerequisites:**
1. Tests must have been generated and executed via `testsprite_generate_code_and_execute`.
2. The local project must be running on the configured port for re-running tests.

#### 3.1.8 `testsprite_check_account_info`

**Purpose:** Retrieves the current user's TestSprite account details.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | — | — | No parameters required. |

**Returns:** User name, subscription plan, available credits, and email address.

---

### 3.2 Feature Matrix

| Feature | Description | Status |
|---------|-------------|--------|
| **Project Bootstrap** | One-time initialization with port, type, and scope configuration. | Available |
| **Code Summary** | AI-generated architectural summary of the full codebase. | Available |
| **PRD Generation** | Standardized product requirement document from source code. | Available |
| **Frontend Test Plans** | Automated test plan generation for UI flows with optional login coverage. | Available |
| **Backend Test Plans** | Automated test plan generation for API endpoints and server logic. | Available |
| **Test Generation & Execution** | AI-driven test code generation and execution against a live local server. | Available |
| **Interactive Dashboard** | Web UI for reviewing, editing, and re-running test cases and steps. | Available |
| **Account Management** | View plan, credits, and account information. | Available |
| **Diff-Scoped Testing** | Limit test generation to staged (uncommitted) changes only. | Available |
| **Dev/Production Mode** | Adaptive test volume based on server mode to prevent overload. | Available |

---

## 4. Workflow & Usage Patterns

### 4.1 First-Time Setup

```
1. Open project in Cursor IDE with TestSprite MCP server enabled
2. Start the local development server (e.g., `bun run dev` on port 3000)
3. Invoke `testsprite_bootstrap` with:
   - localPort: 3000
   - type: "backend" or "frontend"
   - projectPath: absolute path to project root
   - testScope: "codebase"
4. TestSprite creates `.testsprite/config.json` and registers the project
```

### 4.2 Standard Testing Workflow

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│  1. Bootstrap    │────►│  2. Generate Test     │────►│  3. Generate Code   │
│  (first time     │     │     Plan (frontend    │     │     & Execute Tests │
│   only)          │     │     or backend)       │     │                     │
└─────────────────┘     └──────────────────────┘     └─────────┬───────────┘
                                                               │
                                                               ▼
                                                     ┌─────────────────────┐
                                                     │  4. Review Results   │
                                                     │     in Dashboard     │
                                                     │     (edit / re-run)  │
                                                     └─────────────────────┘
```

### 4.3 Incremental / Diff-Based Testing

For testing only staged changes:

```
1. Stage changes with `git add`
2. Bootstrap (or re-use existing config) with testScope: "diff"
3. Generate test plan → Execute → Review
```

### 4.4 Production-Mode Full Suite

For comprehensive testing:

```
1. Build the project: `bun run build`
2. Start in production mode: `bun run start`
3. Generate & execute with serverMode: "production"
4. All tests in the plan are executed (no 15-test cap)
```

---

## 5. Supported Project Types

### 5.1 Framework Compatibility

TestSprite is designed to work with web applications. Based on the tool schemas and documentation:

| Framework | Frontend | Backend | Notes |
|-----------|----------|---------|-------|
| **Next.js** | Yes | Yes | Detected via `npm run build && npm run start` or `npm run dev`. |
| **Vite** | Yes | — | Detected via `npm run build && npm run preview`. |
| **General Node.js** | — | Yes | Any server running on a local port. |

### 5.2 Test Scope Options

| Scope | Description |
|-------|-------------|
| `codebase` | Analyzes and generates tests for the entire project. |
| `diff` | Analyzes only staged (uncommitted) changes for targeted test generation. |

---

## 6. Account & Billing Model

TestSprite operates on a **credit-based subscription model**:

- **Plan tiers** determine the number of available credits and features.
- **Credits** are consumed per test generation and execution cycle.
- Account details (name, email, plan, remaining credits) are queryable via `testsprite_check_account_info`.

---

## 7. Integration with Pixora

### 7.1 Current State

TestSprite is integrated with the **Pixora** project (a multi-tenant agency SaaS platform) through the following configuration:

| Setting | Value |
|---------|-------|
| **Test type** | `backend` |
| **Test scope** | `codebase` |
| **Local endpoint** | `http://localhost:3000/` |
| **TestSprite helper port** | `60114` |
| **Session status** | `init` |

### 7.2 Pixora's Existing Test Infrastructure

Pixora also maintains a parallel **Bun-based unit test suite** (`tests/unit/`) that is independent of TestSprite:

| Test File | Feature Covered |
|-----------|-----------------|
| `authentication.test.ts` | Clerk + JWT cookie auth constants and SSR behavior |
| `ai-chat-errors.test.ts` | AI provider error classification (rate limits, auth, model availability) |
| `contact-messages.test.ts` | Contact form payload parsing and validation |
| `rate-limit.test.ts` | Fixed-window rate limiting pattern |
| `notifications.test.ts` | Activity notification formatting |
| `drag-drop-json.test.ts` | Drag-and-drop reorder logic for editor payloads |
| `funnel-steps.test.ts` | Funnel page URL building and step reordering |
| `ticket-assignment.test.ts` | Ticket assignment notification triggers |
| `pipelines-metrics.test.ts` | Pipeline ticket value aggregation |
| `subdomain.test.ts` | Custom subdomain resolution for middleware routing |
| `payments-stripe.test.ts` | Currency formatting and Stripe Connect OAuth URLs |
| `subscription-invoices.test.ts` | Subscription invoice deduplication |

These unit tests cover pure utility/logic functions. TestSprite complements them by providing **integration-level and end-to-end test generation** against the running application.

### 7.3 Complementary Testing Strategy

```
┌──────────────────────────────────────────────────────────┐
│                    Pixora Test Pyramid                    │
│                                                          │
│                    ┌──────────┐                           │
│                    │ E2E /    │  ◄── TestSprite           │
│                    │ Frontend │      (generated, executed │
│                   ─┤ Tests    ├─     against live app)    │
│                  / └──────────┘ \                         │
│                /                 \                        │
│              ┌────────────────────┐                       │
│              │ Integration /      │  ◄── TestSprite       │
│              │ Backend API Tests  │      (backend mode)   │
│             ─┤                    ├─                      │
│            / └────────────────────┘ \                     │
│          /                           \                    │
│        ┌──────────────────────────────┐                   │
│        │ Unit Tests                   │  ◄── Bun test     │
│        │ (tests/unit/*.test.ts)       │      (manual,     │
│        │                              │       12 suites)  │
│        └──────────────────────────────┘                   │
└──────────────────────────────────────────────────────────┘
```

---

## 8. Security & Privacy Considerations

| Concern | Approach |
|---------|----------|
| **Source code access** | TestSprite reads the local project directory. Code summaries and analysis are sent to TestSprite's cloud for AI processing. |
| **Credential handling** | Environment variables and `.env` files should be excluded from analysis scope. |
| **Network exposure** | Tests run against `localhost` — no public endpoints are required during test execution. |
| **Account isolation** | Each user has their own TestSprite account with plan-specific credit allocation. |

---

## 9. Limitations & Constraints

| Limitation | Detail |
|------------|--------|
| **IDE dependency** | Currently available only through the Cursor IDE MCP integration. |
| **Local server required** | The application under test must be running locally for test execution. |
| **Dev mode throttling** | Frontend tests are limited to 15 high-priority cases when running against a dev server. |
| **Bootstrap idempotency** | The bootstrap tool must not be called if `.testsprite/config.json` already exists. |
| **Credit consumption** | Test generation and execution consume account credits, bounded by the subscription plan. |

---

## 10. Glossary

| Term | Definition |
|------|------------|
| **MCP** | Model Context Protocol — Cursor's plugin system for connecting AI agents to external tools and services. |
| **Bootstrap** | The one-time project initialization step that registers a project with TestSprite. |
| **Test Plan** | A structured set of test scenarios generated by TestSprite's AI engine from codebase analysis. |
| **Test ID** | A unique identifier for an individual test case within a generated test plan. |
| **Server Mode** | Whether the local application is running in `production` (build + serve) or `development` (hot-reload) mode. |
| **Test Scope** | The breadth of code analyzed — `codebase` (all source) or `diff` (staged changes). |
| **Dashboard** | TestSprite's interactive web UI for reviewing, editing, and re-running test results. |
| **PRD** | Product Requirement Document — a standardized specification generated from source code. |
