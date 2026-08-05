# time-weave V1 UI/UX 개선 계획서

- **버전**: 1.0
- **작성일**: 2026-08-05
- **대상 레포지토리**: `C:/Users/s_don/Desktop/Agent_Projects/ToDo-NextJs/time-weave`
- **목표**: V1 MVP 프론트엔드의 디자인 시스템 재사용, 중복 제거, 접근성/UX 개선, 기능 마무리

---

## 1. 현황 요약

| 항목 | 현재 상태 |
|------|-----------|
| V1 MVP 기능 | 구현 완료 (ToDo, Calendar, Friends, Scheduling, OAuth/JWT) |
| 타입/빌드/단위 테스트 | 통과 (`tsc --noEmit`, `next build`, `pnpm test:unit` 24개) |
| 디자인 시스템 | `components/ui/*` (Button, Input, Card, Checkbox, Label, Avatar, Badge, Skeleton)가 삭제된 상태 |
| 신규 UI | `src/components/*`에서 raw Tailwind 클래스로 직접 구현, 디자인 토큰 미활용 |
| 버전 관리 | 기존 파일 삭제/신규 `src/*` 미커밋 상태, 정리 필요 |

---

## 2. 개선 목표

1. 삭제된 UI primitives를 복원/신규 `src/components/ui/`로 이주하여 디자인 시스템 재사용
2. 반복되는 Tailwind 클래스를 공용 컴포넌트로 추출, 일관된 시각/상태/피드백 확보
3. 접근성(버튼 중첩, `aria-label`, `next/image`, 폼 연결) 및 UX 이슈 해결
4. 상태(로딩/에러/빈 상태) 피드백 통일
5. `EventForm` 수정, `MePage` 저장 등 V1 마무리 기능 보완

---

## 3. 우선순위별 상세 계획

### P1. 공용 UI primitives 복원 및 `src/components/ui/` 신설

**목적**: 기존 `components/ui/*`의 설계 의도를 살리되, 현재 `src/lib/theme.ts`, `src/lib/theme-variant.ts`를 활용하는 새 경로로 재배치한다.

**생성/복원 대상 파일**

| 파일 | 역할 |
|------|------|
| `src/components/ui/Button.tsx` | `clay`/`glass`/`flat` variant, color 키 지원 |
| `src/components/ui/Input.tsx` | 포커스 링, placeholder, disabled/read-only |
| `src/components/ui/Card.tsx` | `div`/`section`/`article` polymorphic, 색상/variant |
| `src/components/ui/Label.tsx` | 폼 레이블, color 키 |
| `src/components/ui/Checkbox.tsx` | `useId` 기반 연결, `Label` 재사용 |
| `src/components/ui/Avatar.tsx` | `next/image` 사용, fallback 문자, size |
| `src/components/ui/Badge.tsx` | 태그/점수 표시 |
| `src/components/ui/Skeleton.tsx` | 로딩 상태 표시 |

**핵심 설계 규칙**

- 모든 primitive는 `cn` + `src/lib/theme.ts`의 `colors` + `src/lib/theme-variant.ts`의 `techniques`를 조합한다.
- `bg-[var(--bg-color)]` 대신 `bg-(--bg-color)`를 사용하면서 `globals.css`의 `@theme`와 연동한다.
- color는 `primary`, `secondary`, `success`, `fail`, `warning`, `yellow`를 받되, 기본값은 `primary`이다.
- `Button`은 `clay`, `glass`, `flat` 기법을 받아 shadow/pressed 상태를 자동 적용한다.

**Button 예시**

```tsx
// src/components/ui/Button.tsx
import * as React from "react";
import { cn } from "@/lib/cn";
import { colors, type ColorKey } from "@/lib/theme";
import { techniques, type TechniqueKey } from "@/lib/theme-variant";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: ColorKey;
  technique?: TechniqueKey;
}

export function Button({
  color = "primary",
  technique = "clay",
  className,
  children,
  ...props
}: ButtonProps) {
  const c = colors[color];
  const t = techniques[technique];
  const isGlass = technique === "glass";

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-6 py-2.5 text-sm font-medium",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        t.base,
        t.shadow,
        t.pressed,
        t.active,
        className,
      )}
      style={
        {
          "--bg-color": isGlass
            ? `color-mix(in srgb, ${c.bg} 20%, transparent)`
            : c.bg,
          "--text-color": c.text,
          "--shadow-color": c.shadowColor,
        } as React.CSSProperties
      }
      {...props}>
      {children}
    </button>
  );
}
```

**적용 대상 컴포넌트**

- `TodoForm` → `Button`(`primary`), `Input`(title, dueDate), `Checkbox`(completed)
- `TodoItem` → `Button`(`primary` 수정, `fail` 삭제), `Checkbox`
- `EventForm` → `Button`(`primary`), `Input`(title/location/datetime)
- `FriendSearch` → `Input`(query), `Button`(`primary` 검색, `success` 요청)
- `FriendList` / `ReceivedRequests` / `SentRequests` → `Button`(`fail` 삭제/취소, `success` 수락)
- `SchedulingForm` → `Input`(title, slotMinutes), `Button`(`primary`)
- `FriendsPage` 탭, `CalendarHeader` 화살표/뷰 버튼 → `Button`(`flat` or `clay`)
- `MePage` → `Avatar`, `Input`(nickname), `Button`(`primary`)

**기대 효과**

- 클래스 중복 30% 이상 감소
- `clay`/`glass` pressed/focus 동일 적용
- 색상 변경 시 `colors` 한 곳만 수정

---

### P2. 레이아웃 및 상호작용 버그 수정

#### 2-1. `WeekView`/`MonthView` 버튼 중첩 해결

**문제**: 날짜 셀 `<button>` 안에 `EventCard`의 `<button>` 삭제 버튼이 중첩되어 있어 HTML 규격 위반이며, 삭제 클릭 시 상위 셀 클릭 이벤트로 `setView("day")`가 함께 발생할 수 있다.

**해결 방안**

- 날짜 셀을 `<button>`에서 `<div role="button" tabIndex={0}>`로 변경하거나, `EventCard`를 `<div>`로 변경한다.
- `EventCard`의 삭제 버튼 `onClick`에서 `e.stopPropagation()`을 호출한다.
- 키보드 접근성을 위해 `onKeyDown`으로 `Enter`/`Space` 처리는 셀에만 남긴다.

**대상 파일**

- `src/components/WeekView.tsx`
- `src/components/MonthView.tsx`
- `src/components/EventCard.tsx`

**검증 방법**

- `next lint` (no nested interactive elements)
- 캘린더 주/월 뷰에서 이벤트 삭제 클릭 시 상세 뷰로 전환되지 않는지 수동 확인

#### 2-2. `MePage` `<img>` 경고 제거

**문제**: `src/app/me/page.tsx:33`에서 `<img>` 사용으로 `@next/next/no-img-element` warning이 발생한다.

**해결 방안**

- `Avatar` 공용 컴포넌트를 사용하거나 `next/image`의 `<Image>`로 교체한다.
- 외부 프로필 이미지 URL이므로 `unoptimized` prop을 사용한다.

**대상 파일**

- `src/app/me/page.tsx`

#### 2-3. 폼 요소 접근성 보강

**문제**

- `TodoItem`의 checkbox는 `input`이 텍스트/레이블과 연결되어 있지 않다.
- `CalendarHeader`의 `◀`/`▶` 화살표 버튼에 스크린 리더용 라벨이 없다.
- `FriendSearch` input에 `aria-label`이 없다.

**해결 방안**

- `TodoItem`에 `id` + `Label` 컴포넌트 또는 `aria-label`로 "할 일 완료" 추가
- `CalendarHeader` 버튼에 `aria-label="이전"` / `aria-label="다음"` 추가
- 검색 input에 `aria-label="닉네임 또는 이메일 검색"` 추가

---

### P3. 상태(로딩/에러/빈 상태) 피드백 통일

**목적**: 현재는 `<p className="text-text-muted">불러오는 중...</p>` 형태로 분산되어 있어, `isError` 상태와 일관된 빈 상태 UI가 부족하다.

**생성/사용 컴포넌트**

| 컴포넌트 | 용도 |
|----------|------|
| `src/components/ui/Skeleton.tsx` | 로딩 리스트/카드 대체 |
| `src/components/EmptyState.tsx` | 데이터 없을 때 안내 문구 + 액션 버튼 |
| `src/components/ErrorState.tsx` | 에러 메시지 + 재시도 버튼 |

**적용 대상**

- `TodoList` → `isLoading` 시 `Skeleton` 3줄, `isError` 시 `ErrorState`, `tasks.length === 0` 시 `EmptyState`
- `FriendList`, `ReceivedRequests`, `SentRequests`, `FriendSearch` 동일 패턴
- `CalendarPage` → `isLoading` 시 `Skeleton.Calendar`, `isError` 시 `ErrorState`
- `MePage` → `isLoading` 시 `Skeleton.Profile`, 에러 시 `ErrorState`

**기대 효과**

- 사용자에게 일관된 피드백 제공
- `isError` 핸들링 누락 방지

---

### P4. V1 기능 마무리

#### 4-1. `EventForm` 수정/취소 플로우

**문제**: `EventForm`은 일정 추가만 지원한다.

**해결 방안**

- `EventFormProps`에 `editing?: Event | null`, `onDone?: () => void` 추가
- `useUpdateEvent` hook을 활용하여 `PUT /api/events/[id]` 호출
- 취소 버튼으로 `onDone` 호출
- `CalendarPage`에서 선택한 이벤트를 `EventForm`으로 전달

**대상 파일**

- `src/components/EventForm.tsx`
- `src/app/calendar/page.tsx`
- `src/hooks/useEvents.ts` (`useUpdateEvent` 확인/보강)

#### 4-2. `TodoForm` `dueDate` 안전 처리

**문제**: `editing.dueDate.slice(0, 16)`이 문자열이라 가정하고 있다.

**해결 방안**

- `dueDate`가 `string | undefined`일 때만 slice 처리
- `new Date(dueDate)` 변환 시 유효성 체크, invalid date면 `undefined`로 처리
- `useEffect` 의존성에 `editing?.id` 추가 (객체 참조 변경 대비)

**대상 파일**

- `src/components/TodoForm.tsx`

#### 4-3. `MePage` 닉네임 저장

**문제**: "프로필 저장 API는 V1에서 아직 제공되지 않습니다" 메시지로 임시 처리 중이다.

**해결 방안**

- `PATCH /api/users/me` 엔드포인트 추가 (백엔드)
- `useUpdateMe` hook 추가
- 저장 성공 시 `useMe` 쿼리 무효화

**대상 파일**

- `src/app/api/users/me/route.ts`
- `src/hooks/useMe.ts`
- `src/app/me/page.tsx`

---

### P5. 버전 관리 및 품질 확보

**현재 문제**: 기존 `components/ui/*`, `app/*`, `lib/*`가 삭제되고 `src/*`가 미커밋인 상태로 남아 있다.

**작업**

1. `git status`로 삭제/추가 파일 리스트 재확인
2. `.gitignore`, `.npmrc`, `next.config.ts`, `tsconfig.json` 변경 사항 검토
3. 의도하지 않은 삭제(예: `public/fonts`, `public/img`)가 없는지 확인
4. 아래와 같이 커밋 분류
   - `refactor(ui): src 구조로 마이그레이션` (파일 이동/삭제 묶음)
   - `feat(ui): 공용 UI primitives 추가`
   - `fix(ui): 캘린더 버튼 중첩 및 접근성 개선`
   - `feat(me): 프로필 수정 API 및 UI 연동`

---

## 4. 작업 순서(마일스톤)

| 단계 | 기간 | 주요 산출물 | 완료 기준 |
|------|------|-------------|-----------|
| P1-1 | 1차 | `src/components/ui/*` primitives | `Button`/`Input`/`Card`/`Checkbox`/`Label`/`Avatar`/`Badge`/`Skeleton` 생성, `pnpm tsc` 통과 |
| P1-2 | 1차 | 기존 UI 대체 | `TodoForm`, `EventForm`, `FriendSearch`, `FriendList`, `FriendRequests`, `SchedulingForm`, `MePage`에서 primitives 사용 |
| P2 | 2차 | 레이아웃/접근성 수정 | `WeekView`/`MonthView`/`EventCard` 버튼 중첩 제거, `<img>` 제거, `aria-label` 추가, `next lint` 0 warning |
| P3 | 2차 | 상태 피드백 통일 | `EmptyState`/`ErrorState`/`Skeleton` 적용, `isError` 핸들링 추가 |
| P4 | 3차 | V1 기능 마무리 | `EventForm` 수정, `MePage` 저장, `TodoForm` dueDate 안전 처리 |
| P5 | 3차 | 커밋/품질 | `tsc`, `test:unit`, `next build`, `next lint` 전부 통과 후 커밋 |

---

## 5. 검증 기준

| 검증 항목 | 방법 | 기대 결과 |
|-----------|------|-----------|
| 타입 안정성 | `pnpm tsc --noEmit` | exit 0 |
| 린트 | `pnpm next lint` | 0 warning, 0 error |
| 단위 테스트 | `pnpm test:unit` | 24개 통과 |
| 빌드 | `pnpm next build` | exit 0 |
| UI primitives 일관성 | `app/preview/page.tsx` 복원/신규 프리뷰 페이지 | 모든 variant가 clay/glass/flat로 정상 렌더링 |
| 접근성 | 수동 키보드 탭 + Lighthouse | 점수 90+ |
| 기능 검증 | 수동 클릭 + E2E(선택) | ToDo CRUD, 일정 CRUD, 친구 요청, 일정 조율 정상 |

---

## 6. 롤백 및 위험 관리

- **롤백**: 각 단계별 브랜치를 분리하거나, 커밋을 세분화하여 `git revert`/`git reset`으로 되돌린다.
- **위험**: `src/components/ui/*`를 새로 추가하면서 기존 `components/ui/*`와 혼동될 수 있다. `components/ui/*`는 이미 삭제되어 있으므로 `src/components/ui/`만 활용하고, 중복 경로는 문서에 명시한다.
- **위험**: Tailwind 4 `@theme` 문법에서 `bg-(--bg-color)`와 `bg-[var(--bg-color)]`가 혼용될 수 있다. `globals.css`의 `@theme` 선언과 맞춰 일관되게 사용한다.

---

## 7. 범위 외 (V2)

- 실시간 알림/채팅
- 댓글, 이미지 업로드
- 집중 통계/랭킹
- 다크 모드 완전 지원 (현재 `color-scheme: light dark`만 선언된 상태)

---

## 8. 참고 자료

- 기존 디자인 시스템 예시: `git show HEAD:components/ui/button.tsx`
- 현재 UI: `src/components/*.tsx`
- 색상/variant 토큰: `src/lib/theme.ts`, `src/lib/theme-variant.ts`
- 통합 보고서: `reports/20260805_S7-integration_time-weave.md`
