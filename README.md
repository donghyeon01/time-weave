# Time-Weave

> **일정, 할 일, 친구를 하나로 엮는 스마트 스케줄러**

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

Next.js 기반의 통합 일정 관리 웹 애플리케이션. 개인의 할 일과 캘린더를 관리하는 것을 넘어, 친구 관계를 맺은 사용자들의 일정을 분석해 **모두가 가능한 약속 시간을 자동으로 추천**한다.

> **개발 상태**: 기능 개발은 `dev` 브랜치에서 진행 중이다. `master`에는 프로젝트 기반 구조(scaffold)가 있다.

## Features (`dev` 브랜치 기준)

- **소셜 로그인** — Kakao·Google OAuth + JWT Access/Refresh Token 인증
- **ToDo** — 할 일 CRUD, 우선순위·마감일 관리
- **캘린더** — 월/일 뷰, 일정 생성·수정·삭제, 기간별 일정 조회 API
- **친구 관계** — 사용자 검색, 친구 요청/수락/삭제, 받은·보낸 요청 관리
- **스마트 일정 조율** — 참여자들의 캘린더를 분석해 공통 가능 시간대를 계산·추천

## Tech Stack

| 구분 | 기술 |
|---|---|
| Framework | Next.js 15 (App Router, Route Groups) |
| Language | TypeScript, React 19 |
| Database | MongoDB (Mongoose), Redis |
| Auth | OAuth 2.0 (Kakao·Google), jose (JWT) |
| Client State | Zustand, TanStack Query |
| HTTP / Validation | ky, Zod |
| Styling | Tailwind CSS 4 |
| Test | Vitest (friendship·event·scheduling 도메인 테스트) |
| Infra | Docker Compose (MongoDB) |

## Project Structure

```text
src/
├── app/
│   ├── (landing)/            # 랜딩 페이지
│   ├── (main)/               # 인증 후 메인 영역
│   │   ├── calendar/         # 캘린더
│   │   ├── todos/            # 할 일
│   │   ├── friends/          # 친구 관계
│   │   ├── scheduling/       # 스마트 일정 조율
│   │   └── me/               # 내 정보
│   └── api/                  # Route Handlers
│       ├── auth/             # OAuth signin/callback, refresh, logout
│       ├── events/           # 일정 CRUD, 기간 조회
│       ├── friends/          # 친구 검색·요청·수락
│       ├── scheduling/       # 일정 조율
│       ├── tasks/            # 할 일 CRUD
│       └── users/me/         # 내 정보 (middleware.ts로 JWT 검증)
├── components/               # 뷰 컴포넌트 (MonthView, DayView, TodoItem 등)
├── lib/                      # jwt, providers, error 등 공용 로직
└── types/                    # 공유 타입
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- Docker (MongoDB 컨테이너용)

### Run

```bash
git clone -b dev https://github.com/donghyeon01/time-weave.git
cd time-weave

# MongoDB 컨테이너 기동
docker compose up -d

# 환경 변수 설정 (OAuth 키·JWT 시크릿·DB 접속 정보)
cp .env.example .env

pnpm install
pnpm dev
```

`http://localhost:3000`에서 확인한다.

### Test

```bash
pnpm test:unit   # friendship·event·scheduling 도메인 테스트
pnpm typecheck
```

## License

MIT
