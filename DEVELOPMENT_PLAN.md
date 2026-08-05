# Time-Weave 개발 기획서

---

## 1. 프로젝트 개요

### 1.1 프로젝트 목표

`time-weave`는 개인 일정(ToDo/Calendar)과 친구 관계를 연결해, 다수 참여자의 공통 가능 시간을 자동으로 추천하는 스마트 스케줄링 서비스입니다.

핵심 가치는 다음과 같습니다.

- 개인 할 일과 일정을 체계적으로 관리한다.
- 친구 관계를 기반으로 일정 조율 요청을 생성·관리한다.
- 참여자들의 기존 일정을 분석해 최적의 공동 시간을 추천한다.

### 1.2 버전별 범위

#### V1 (MVP)

- 카카오/구글 OAuth 로그인
- 프로필 조회/수정
- ToDo CRUD
- 일정(Calendar) CRUD
- 친구 요청/수락/거절/조회
- 일정 조율(공통 가능 시간 추천)

#### V2 (확장)

- 실시간 알림
- 1:1/그룹 채팅
- 댓글(커뮤니티)
- 이미지 직접 업로드
- 집중 통계/랭킹

### 1.3 핵심 기능 요약

| 구분           | 기능                                                                    |
| -------------- | ----------------------------------------------------------------------- |
| 인증           | 카카오/구글 OAuth 로그인, JWT Access/Refresh Token, 로그아웃, 세션 제한 |
| 사용자         | 내 정보 조회                                                            |
| ToDo           | 할 일 CRUD, 완료 상태 토글, 마감일 관리                                 |
| 일정(Calendar) | 일정 CRUD, 기간 조회, 종일 일정, 장소 정보                              |
| 친구           | 친구 요청/수락/거절/삭제, 받은/보낸 요청 조회                           |
| 일정 조율      | 참여자 선택, 공통 가능 시간 계산, 상위 3개 추천                         |

---

## 2. 기술 스택

| 영역            | 기술                    | 비고                                  |
| --------------- | ----------------------- | ------------------------------------- |
| 프레임워크      | Next.js 15 (App Router) | Server Component / Server Action 활용 |
| 언어            | TypeScript 5.7          | 타입 안정성 확보                      |
| 스타일          | Tailwind CSS 4          | UI 구현 시 사용                       |
| 상태 관리       | Zustand 5               | 클라이언트 전역 상태                  |
| 서버 상태       | TanStack Query 5        | 데이터 페칭 및 캐싱                   |
| HTTP 클라이언트 | ky                      | API 통신, fetch 래퍼                  |
| 캘린더          | Tailwind + date-fns     | 직접 구현, 커스텀 뷰                  |
| V1 DB           | MongoDB 8               | NoSQL 메인 저장소                     |
| V2 DB           | PostgreSQL/Supeabase    | 채팅/댓글/통계용                      |
| 캐시/실시간     | Redis 7                 | MVP부터 세션/캐싱/Pub/Sub             |
| 파일 저장소     | Cloudflare R2           | 프로필 이미지 업로드(V2)              |
| ODM             | Mongoose 8              | 스키마/모델 관리                      |
| 인증            | NextAuth.js v4.24, Jose | OAuth(Kakao/Google), JWT 서명/검증    |
| 실시간          | Socket.io               | 자체 구축                             |
| 검증            | Zod 3.24                | 입력값 유효성 검사                    |
| API 문서        | Scalar / Swagger        | OpenAPI 기반 API 문서 자동화          |
| 번들러          | Next.js 내장 Turbopack  | 개발/빌드                             |
| 패키지 매니저   | pnpm 10                 | 의존성 관리                           |

---

## 3. 시스템 아키텍처

```text
사용자
  ↓
Next.js App Router
  ├─ React Server Component / Server Action
  ├─ API Route Handler (/api/*)
  ├─ MongoDB (Mongoose)
  ├─ Redis (세션/Pub/Sub/캐시)
  └─ Socket.io (WebSocket, V2)
```

### 3.1 레이어 구분

- **Presentation Layer**
- **Server Action / API Route Handler**: 인증, 입력 검증, 응답 조립
- **Service Layer**: 비즈니스 로직, 트랜잭션, 권한 검사
- **Data Access Layer**: Mongoose Model / Repository
- **Database**: MongoDB
- **Cache Layer**: Redis
- **Real-time Layer**: Socket.io + Redis Pub/Sub (V2)

### 3.2 Redis 활용

Redis는 메모리 기반 키-값 저장소로, `time-weave`의 실시간 기능과 캐싱에 사용합니다.

| 용도               | Redis 자료구조/기능 | 설명                                        |
| ------------------ | ------------------- | ------------------------------------------- |
| 세션/Refresh Token | String, Hash        | 동시 세션 제한 및 만료 시간(TTL) 관리       |
| 실시간 알림/채팅   | Pub/Sub             | Socket.io 메시지를 다중 서버에 브로드캐스트 |
| 온라인 상태        | String with TTL     | 사용자 접속 상태, 마지막 활동 시간 저장     |
| 데이터 캐싱        | String              | 자주 조회하는 프로필, 친구 목록, 일정 캐싱  |
| 랭킹/카운터        | Sorted Set(ZSET)    | 집중 시간, 참여율 등 점수 기반 정렬         |

---

## 4. 데이터 모델

### 4.1 User

```ts
interface IUser {
  _id: ObjectId;
  email: string; // unique, OAuth에서 제공
  name: string; // OAuth에서 받아온 원본 이름
  nickname: string; // time-weave에서 수정 가능한 닉네임
  profileImage?: string; // 프로필 이미지 URL
  provider: "kakao" | "google";
  providerAccountId: string; // OAuth 제공자별 고유 ID
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.2 RefreshToken

```ts
interface IRefreshToken {
  _id: ObjectId;
  userId: ObjectId;
  tokenId: string; // JWT jti
  tokenHash: string; // SHA-256 해시값 저장
  userAgent: string;
  ipAddress: string;
  expiresAt: Date;
  lastAccessedAt: Date;
}
```

### 4.3 Friendship

```ts
interface IFriendship {
  _id: ObjectId;
  requesterId: ObjectId;
  receiverId: ObjectId;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.4 Task

```ts
interface ITask {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  description?: string;
  dueDate?: Date;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.5 Event

```ts
interface IEvent {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.6 SchedulingRequest

```ts
interface ISchedulingRequest {
  _id: ObjectId;
  hostId: ObjectId;
  title: string;
  description?: string;
  startDate: Date; // 조율 시작일
  endDate: Date; // 조율 종료일
  slotMinutes?: number; // 슬롯 간격(선택)
  status: "OPEN" | "VOTING" | "CONFIRMED" | "CANCELLED";
  participantIds: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.7 인덱스 정책

```text
User: email(Unique), provider + providerAccountId(Unique)
RefreshToken: tokenHash(Unique), userId
Friendship: requesterId + receiverId, requesterId + status, receiverId + status
Task: userId, userId + dueDate
Event: userId, userId + startTime
SchedulingRequest: hostId, hostId + status
```

### 4.8 V2 데이터 모델

```ts
interface INotification {
  _id: ObjectId;
  userId: ObjectId; // 수신자
  type:
    | "FRIEND_REQUEST"
    | "SCHEDULING_INVITE"
    | "SCHEDULING_CONFIRMED"
    | "CHAT";
  message: string;
  targetId?: ObjectId; // 연결 대상 ID
  targetType?: string; // 'friendship' | 'scheduling' | 'chat'
  isRead: boolean;
  createdAt: Date;
}

interface IChatRoom {
  _id: ObjectId;
  participantIds: ObjectId[];
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface IChatMessage {
  _id: ObjectId;
  roomId: ObjectId;
  senderId: ObjectId;
  content: string;
  createdAt: Date;
}

interface IComment {
  _id: ObjectId;
  targetType: "scheduling" | "event";
  targetId: ObjectId;
  authorId: ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 5. 기능 명세 및 API

### 공통 응답 형식

```json
{
  "success": true,
  "data": {}
}
```

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "인증이 필요합니다."
  }
}
```

### 5.1 인증 (Auth)

| 기능 ID | 기능          | 메서드     | 엔드포인트                     | 비고                               |
| ------- | ------------- | ---------- | ------------------------------ | ---------------------------------- |
| AUTH-01 | 카카오 로그인 | `GET`      | `/api/auth/signin/kakao`       | OAuth 2.0 Authorization Code 흐름  |
| AUTH-02 | 구글 로그인   | `GET`      | `/api/auth/signin/google`      | OAuth 2.0 Authorization Code 흐름  |
| AUTH-03 | OAuth 콜백    | `GET/POST` | `/api/auth/callback/:provider` | 사용자 생성/조회, JWT 발급         |
| AUTH-04 | 토큰 재발급   | `POST`     | `/api/auth/refresh`            | Refresh Token Rotation             |
| AUTH-05 | 로그아웃      | `POST`     | `/api/auth/logout`             | Refresh Token 쿠키 만료 및 DB 삭제 |

#### OAuth 로그인 흐름

1. 사용자가 `/api/auth/signin/kakao` 또는 `/api/auth/signin/google` 호출
2. NextAuth.js v4.24이 제공자 인증 서버로 Redirect
3. 인증 성공 후 `/api/auth/callback/:provider`로 Authorization Code 수신
4. 백엔드에서 Access/Refresh Token 교환 및 사용자 정보 조회
5. OAuth 동의 항목: `name`, `nickname`, `profile_image`, `email` (email은 선택 동의)
6. OAuth에서 `name`, `nickname`, `profileImage`를 받아 저장 또는 갱신
7. `provider` + `providerAccountId` 기준으로 기존 사용자 조회 또는 생성
8. 신규 사용자의 `nickname`은 OAuth `name` 또는 `nickname` 값으로 초기화
9. 자체 JWT Access Token 발급, Server Component는 `headers()`로 접근
10. Refresh Token은 httpOnly/Secure/SameSite 쿠키로 저장

#### 토큰 정책

- Access Token: 30분
- Refresh Token: 7일
- 동일 사용자의 최대 동시 세션 수: 5개
- Refresh Token은 해시값만 DB에 저장하고, 평문은 httpOnly 쿠키로만 전달

### 5.2 사용자 (User)

| 기능 ID | 기능         | 메서드 | 엔드포인트      | 비고                           |
| ------- | ------------ | ------ | --------------- | ------------------------------ |
| USER-01 | 내 정보 조회 | `GET`  | `/api/users/me` |                                |
| USER-02 | 프로필 수정  | `PUT`  | `/api/users/me` | 닉네임, 프로필 이미지 URL 변경 |

#### 닉네임 정책

- 2~20자
- 한글/영문/숫자/밑줄(\_)만 허용
- 중복 불가
- `admin`, `root` 등 예약어 금지

### 5.3 ToDo

| 기능 ID | 기능            | 메서드   | 엔드포인트        | 비고               |
| ------- | --------------- | -------- | ----------------- | ------------------ |
| TASK-01 | 할 일 생성      | `POST`   | `/api/tasks`      | 201 Created        |
| TASK-02 | 할 일 목록 조회 | `GET`    | `/api/tasks`      | 로그인 사용자 기준 |
| TASK-03 | 할 일 수정      | `PUT`    | `/api/tasks/[id]` | 작성자만 가능      |
| TASK-04 | 할 일 삭제      | `DELETE` | `/api/tasks/[id]` | 204 No Content     |

### 5.4 일정 (Event)

| 기능 ID | 기능           | 메서드   | 엔드포인트          | 비고                         |
| ------- | -------------- | -------- | ------------------- | ---------------------------- |
| EVT-01  | 일정 생성      | `POST`   | `/api/events`       | 201 Created                  |
| EVT-02  | 일정 목록 조회 | `GET`    | `/api/events`       | 로그인 사용자 기준           |
| EVT-03  | 기간별 조회    | `GET`    | `/api/events/range` | `start`, `end` 쿼리 파라미터 |
| EVT-04  | 일정 수정      | `PUT`    | `/api/events/[id]`  | 작성자만 가능                |
| EVT-05  | 일정 삭제      | `DELETE` | `/api/events/[id]`  | 204 No Content               |

### 5.5 친구 (Friendship)

| 기능 ID | 기능                | 메서드   | 엔드포인트                          | 비고                 |
| ------- | ------------------- | -------- | ----------------------------------- | -------------------- |
| FND-01  | 친구 목록 조회      | `GET`    | `/api/friends`                      | ACCEPTED 상태        |
| FND-02  | 받은 요청 조회      | `GET`    | `/api/friends/requests/received`    | PENDING 상태         |
| FND-03  | 보낸 요청 조회      | `GET`    | `/api/friends/requests/sent`        | PENDING 상태         |
| FND-04  | 친구 검색           | `GET`    | `/api/friends/search`               | 닉네임 기반          |
| FND-05  | 친구 요청 보내기    | `POST`   | `/api/friends`                      | 닉네임 또는 이메일   |
| FND-06  | 친구 요청 수락      | `POST`   | `/api/friends/requests/[id]/accept` | Friendship 상태 변경 |
| FND-07  | 친구 삭제/거절/취소 | `DELETE` | `/api/friends/[id]`                 | 204 No Content       |

### 5.6 일정 조율 (Scheduling)

| 기능 ID | 기능                | 메서드 | 엔드포인트        | 비고               |
| ------- | ------------------- | ------ | ----------------- | ------------------ |
| SCH-01  | 공통 가능 시간 계산 | `POST` | `/api/scheduling` | 상위 3개 추천 반환 |

#### 조율 엔진 알고리즘

1. 참여자 목록 구성(호스트 + 선택된 친구들)
2. 참여자들의 `Event`를 기간 내 조회
3. 기본 고정 블록 또는 `slotMinutes` 기반 슬라이딩 윈도우 생성
   - 기본 블록: 10:00~12:00, 14:00~16:00, 18:00~20:00, 20:00~22:00
   - 슬롯 간격이 주어지면 09:00~22:00 사이를 해당 간격으로 분할
4. 각 블록별로 참여자 일정과 충돌 검사
5. 참여 가능 비율(`percent`)을 계산해 내림차순 정렬
6. 상위 3개 후보 반환

---

## 6. 비기능 요구사항

### 6.1 성능

- 페이지 최초 로딩 3초 이내
- API 평균 응답 시간 500ms 이하
- 일정 조율 API는 1초 이내 응답(5인 이하 참여자 기준)

### 6.2 보안

- JWT Access Token + Refresh Token(Rotation)
- httpOnly/Secure/SameSite 쿠키로 Refresh Token 저장
- OAuth 제공자 토큰은 서버에서만 사용, 클라이언트에 노출 금지
- 입력값 Zod 검증
- CORS 정책 적용
- Rate Limiting: 로그인/친구요청/친구검색 API 제한
- CSRF 방어: NextAuth.js 쿠키 기본 보호 + SameSite 정책
- MongoDB Injection 방어(Mongoose 파라미터 바인딩)

### 6.3 확장성

- API Route 기반 모듈화
- 비즈니스 로직을 Service 함수로 분리
- Mongoose 모델 중앙 관리

### 6.4 운영성

- API 에러 로깅
- 글로벌 예외 핸들러 적용
- 일관된 에러 응답 형식

---

## 7. 개발 단계

### Phase 1. 프로젝트 설정

- ESLint / TypeScript 설정 점검
- MongoDB, Redis 연결 설정
- 공통 유틸(`cn`, `theme`)과 충돌 없이 유지

### Phase 2. 인증 시스템

- User 모델(provider, providerAccountId 기준)
- NextAuth.js v4.24 Provider 설정(Kakao, Google)
- JWT 발급/검증(Jose)
- Refresh Token 모델 및 Rotation
- OAuth 로그인/콜백/로그아웃 API

### Phase 3. ToDo

- Task 모델
- CRUD API 및 권한 검사

### Phase 4. 일정(Calendar)

- Event 모델
- CRUD 및 기간 조회 API
- FullCalendar 데이터 연동 준비

### Phase 5. 친구 관계

- Friendship 모델
- 요청/수락/거절/조회 API

### Phase 6. 일정 조율 엔진

- Scheduling API
- 참여자 일정 충돌 분석
- 추천 슬롯 계산

### Phase 7. 통합 및 검증

- 전체 API 연동 테스트
- 단위/통합 테스트 작성
- 타입 검사
- 빌드 검증

---

## 8. 코딩 규칙

### 8.1 공통

- 기존 코드 분석 후 구현
- 재사용 가능한 유틸/함수 우선 사용
- 중복 구현 금지
- DTO/Request Schema 사용(Zod)

### 8.2 Next.js / React

- Server Action 우선 사용
- 데이터 페칭은 TanStack Query
- 클라이언트 상태는 Zustand
- 컴포넌트 300줄 이하 유지

### 8.3 API 설계

- `/api/[domain]/[action]` 형태
- 일관된 성공/에러 응답 형식
- 인증은 middleware 또는 API 내부 검증

### 8.4 데이터베이스

- Mongoose 스키마는 `createdAt`, `updatedAt` 포함
- ObjectId 참조 대신 필요 시 `populate` 사용
- 인덱스는 조회 패턴에 따라 추가

---

## 9. Definition of Done

- [x] 기능 요구사항 충족
- [x] `next build` 성공
- [x] `tsc --noEmit` 통과
- [x] `next lint` 통과
- [x] 관련 API 테스트(단위/통합) 통과
- [x] 문서(본 기획서) 갱신 완료

> S7 통합 검증 완료: `2026-08-05`

---

## 10. 추가 개선 사항

기존 `all-in-one-scheduler`와 `OASIS-25` 개발지시계획서를 분석하여 적용할 개선 사항입니다.

### 10.1 보안 강화

- OAuth 로그인 전용: 비밀번호 저장 없음
- Refresh Token 평문 저장 금지: 해시만 DB 저장
- 동시 세션 제한(5개)
- User-Agent/IP 바인딩 검토

### 10.2 일정 조율 엔진 개선

- 고정 블록 외 사용자 정의 `slotMinutes` 지원
- 참여 가능 비율뿐 아니라 참여자 수 기반 가중치 적용
- 상위 3개 제한 대신 `limit` 쿼리 파라미터 지원 검토

### 10.3 알림(선택)

- 친구 요청, 일정 조율 확정 시 알림 생성
- 초기 MVP에서는 서버 내 알림 테이블로 구현, 실시간 푸시는 V2

### 10.4 D-Day 계산

- Task/Event `dueDate` 기반으로 D-Day 계산
- 별도 엔티티 없이 조회 시 계산하여 반환

### 10.5 환경 변수

```text
# Database
MONGODB_URI=mongodb://...

# Cache
REDIS_URI=redis://...

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
AUTH_KAKAO_CLIENT_ID=...
AUTH_KAKAO_CLIENT_SECRET=...
AUTH_KAKAO_REDIRECT_URI=...
AUTH_GOOGLE_CLIENT_ID=...
AUTH_GOOGLE_CLIENT_SECRET=...

# JWT
JWT_SECRET=...
```

### 10.6 프로필 이미지 저장

- MVP에서는 OAuth 제공 이미지 URL을 우선 사용
- 사용자 업로드 이미지는 OCI Object Storage 또는 AWS S3에 저장 후 URL만 DB에 보관
- 이미지 리사이즈/용량 제한은 V2에서 고려

---

## 11. 위험 및 제약

| 위험                            | 대응                                               |
| ------------------------------- | -------------------------------------------------- |
| MongoDB와 Mongoose 버전 호환성  | package.json 버전 고정 및 `tsc` 검증               |
| Next.js 15 App Router 학습 곡선 | Server Action 위주로 점진 적용                     |
| 일정 조율 성능 저하             | 참여자 수 제한, 인덱스(`userId`, `startTime`) 추가 |
| Socket.io 운영 복잡도           | V2로 분리, Redis Adapter 적용, 부하 테스트         |

---

## 12. V2 기술 결정

V1 결정 사항은 기술 스택과 개발 단계에 이미 반영. 아래는 V2에서 확정한 기술 사항입니다.

### 12.1 DB 아키텍처: MongoDB + PostgreSQL/Supeabase 분리

V2에서는 채팅/댓글/통계 등 관계형/분석 데이터를 PostgreSQL/Supeabase로 분리 운영합니다.

| 데이터                                    | 저장소               | 이유                                   |
| ----------------------------------------- | -------------------- | -------------------------------------- |
| User, ToDo, Event, Friendship, Scheduling | MongoDB              | 이미 Mongoose 기반, Document 구조 적합 |
| Chat, Comment, Notification, Ranking      | PostgreSQL/Supeabase | 관계형 조인, 실시간, 통계에 유리       |

#### MongoDB + PostgreSQL 혼용 시 고려 사항

- **이중 DB**: Mongoose + Prisma 두 개의 ODM/ORM 운영 필요
- **트랜잭션**: 분산 트랜잭션은 SAGA 패턴 또는 이벤트 기반 일관성 적용
- **마이그레이션**: MongoDB에서 관계형으로 데이터 이전 시 스크립트 작성
- **Supabase 비용**: 무료 티어 500MB/500K 요청, 초과 시 월 $25~ 시작

### 12.2 Socket.io 초보자 구성 가이드

Socket.io를 처음 사용하는 팀원도 따라갈 수 있도록 단계별 구성입니다.

#### 1단계: 이해

- Socket.io는 WebSocket을 기반으로 한 실시간 양방향 통신 라이브러리
- **Room**: 채팅방, 알림 대상 그룹을 구분하는 공간
- **Namespace**: `/chat`, `/notification` 등 기능별 채널 분리
- **Event**: `connection`, `message`, `join`, `leave` 등 메시지 단위

#### 2단계: 패키지 설치

```bash
npm i socket.io socket.io-redis-adapter
```

#### 3단계: 별도 Node.js 서버 운영(권장)

```text
Next.js (HTTP API)
  ↓
Socket.io Server (Node.js, Port 3001)
  ↓
Redis (Pub/Sub)
  ↓
MongoDB / PostgreSQL
```

- Next.js App Router와 Socket.io custom server를 같이 두면 복잡도 증가
- V2에서는 Socket.io 전용 `server/socket.js` 실행
- Next.js API Route에서 `io` 인스턴스에 emit

#### 4단계: Redis Adapter 연결

```js
const { createAdapter } = require("@socket.io/redis-adapter");
const io = new Server(server);
const pubClient = createClient({ url: process.env.REDIS_URI });
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));
```

- Redis Adapter가 없으면 다중 서버 환경에서 메시지가 전달되지 않음
- 운영 시 Redis Sentinel 또는 Redis Cluster 고려

#### 5단계: 클라이언트 연결

```ts
import { io } from 'socket.io-client';
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);
socket.emit('join-room', roomId);
socket.on('message', (msg) => { ... });
```

### 12.3 캘린더: 직접 구현

커스텀 뷰(다중 사용자 타임라인, 조율 후보 하이라이트)가 필요하므로 `react-big-calendar` 대신 직접 구현합니다.

- **기술 조합**: Tailwind CSS + `date-fns`
- **구성 요소**:
  - `MonthView`: 월간 셀 그리드
  - `WeekView`: 주간 타임라인
  - `DayView`: 일간 상세
  - `EventCard`: 일정 아이템
  - `SchedulingOverlay`: 조율 추천 슬롯 표시
- **개발 공수**: 2~3주 예상(캘린더 코어 기준)

### 12.4 일정 조율 알고리즘 V2: Interval Tree 추천

V2에서는 참여자가 10인 이상일 때 **Interval Tree**를 적용합니다.

| 항목      | 브루트포스                | Interval Tree   |
| --------- | ------------------------- | --------------- |
| 복잡도    | O(블록 × 참여자 × 이벤트) | O(블록 × log n) |
| 메모리    | 낮음                      | 중간(트리 구조) |
| 구현      | 단순                      | 약간 복잡       |
| 적용 시점 | MVP                       | 10인 이상       |

**추천 이유**:

- 일정 데이터를 시간 구간(interval)으로 변환
- 각 참여자의 일정을 Interval Tree에 삽입
- 추천 블록과 겹치는 구간만 `log n`에 탐색
- PostgreSQL로 마이그레이션 시 `tsrange` + GiST 인덱스로 대체 가능

### 12.5 이미지 업로드 저장소: Cloudflare R2

- AWS S3 호환 API
- 무료 egress(다운로드) 정책
- 요금: $0.015/GB 저장, 첫 10GB/월 무료
- 퍼블릭 URL + Signed URL 지원
- 업로드 후 `profileImage` 필드에 URL 저장
