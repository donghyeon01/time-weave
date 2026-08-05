# Time-Weave 파스텔 + 클레이모피즘 UI 개선 계획서 (임시)

> 이 문서는 개선 작업을 위한 임시 계획서입니다. 개선 완료 후 삭제하세요.

## 1. 목표

`globals.css`의 파스텔 토큰과 `src/lib/theme-variant.ts`의 `clay`/`glass`/`flat` 기법을 모든 UI 컴포넌트에 일관되게 적용하여, Time-Weave만의 부드럽고 입체적인 파스텔 + 클레이모피즘 느낌을 만듭니다.

## 2. 디자인 토큰

`@theme`로 이미 정의된 값을 우선 사용합니다.

- `--color-primary`, `--color-primary-dark`: 하늘빛 파스텔
- `--color-secondary`, `--color-secondary-dark`: 핑크빛 파스텔
- `--color-yellow`, `--color-yellow-dark`: 카카오 버튼용
- `--color-white`, `--color-text`: 구글/보조 버튼용
- `--color-fail`, `--color-success`, `--color-warning`: 상태 피드백
- `--shadow-clay`, `--shadow-glass`, `--shadow-clay-pressed`: 그림자

## 3. `theme-variant.ts` 활용 방향

```ts
import { techniques } from "@/lib/theme-variant";
import { colors, type ColorKey } from "@/lib/theme";
```

- `clay`: 주요 CTA, 카드, 버튼 (둥근 2xl + 부드러운 그림자 + 누르는 느낌)
- `glass`: 배경 위에 띄우는 카드/모달 (반투명 + 블러)
- `flat`: 탭, 보조 버튼, 체크박스 (경량)

## 4. 컴포넌트별 개선 항목

### 4.1 Button / Link
- 이미 `color` + `technique`를 받도록 되어 있음.
- 랜딩의 `Link` 버튼에 `techniques.clay.*`를 적용하는 패턴을 `ButtonLink`로 추출.
- 하드코딩된 `#FEE500`을 `color="yellow"` + `technique="clay"`로 대체.

### 4.2 Card
- `color`/`technique` prop 추가.
- 기본: `color="white"`, `technique="clay"`.
- 투명 배경이 필요한 경우 `technique="glass"` 사용.

### 4.3 Input / Textarea / Label
- `clay` 베이스를 활용해 `rounded-2xl`, `shadow-clay` 적용.
- `focus` 상태에서 `ring-(--color-primary)`.
- `bg-white/80` 또는 `bg-(--color-white)`로 명암 확보.

### 4.4 Checkbox
- `techniques.flat.base` + 체크 시 `bg-(--color-success)`.
- 커스텀 체크 표시를 `clay` 느낌의 원/체크 아이콘으로 교체.

### 4.5 Header
- `sticky` 상단바를 `techniques.glass.base` + `techniques.glass.shadow`로 변경.
- 네비게이션 링크에 `techniques.clay.base`/`active`/`pressed` 적용.
- 모바일 메뉴에도 `techniques.glass` 배경.

### 4.6 EmptyState / ErrorState
- 메시지 영역을 `Card`로 감싸 `clay` 또는 `glass` 느낌 부여.
- 아이콘/일러스트가 있다면 `logo.png` 또는 `typo.png` 재사용 검토.

### 4.7 Skeleton
- `clay`/`glass` 기법의 배경 변형을 적용.
- 단색 `bg-primary/20` 대신 `bg-white/60` + `shadow-glass`.

### 4.8 Calendar
- 월/주/일 셀에 `techniques.clay.base` 느낌의 테두리/그림자.
- 선택된 날짜: `bg-(--color-primary)` + `shadow-clay`.
- 이벤트 카드: `Badge` 컴포넌트를 `clay` 또는 `glass`로.

### 4.9 Todo / Friend / Me / Scheduling
- 각 항목 카드에 `Card` 적용.
- `Button`들은 `color`/`technique` prop 사용.
- 프로필 영역: `Avatar` + `glass` 카드 조합.

## 5. 애니메이션/인터랙션

- `techniques.clay.active`로 누르는 느낌 유지.
- `hover:shadow-clay-pressed` 또는 `hover:scale-[1.02]`로 살짝 떠오르는 효과.
- 로고에는 부드러운 `animate-float` (CSS keyframes) 추가 검토.

## 6. 작업 순서

1. `Card`에 `color`/`technique` prop 추가
2. `ButtonLink` (a 태그용) 신규 또는 `Button`을 `asChild` 확장
3. `Header`, `EmptyState`, `ErrorState`를 `Card`/`techniques.glass`로 마이그레이션
4. `Input`, `Textarea`, `Checkbox`에 `clay`/`flat` 적용
5. `Calendar` 셀, `TodoItem`, `FriendList` 항목에 카드 적용
6. `next lint` + `pnpm typecheck` 검증

## 7. 주의사항

- `color-contrast` 준수 (대비 4.5:1 이상).
- `prefers-reduced-motion`에 따라 부드러운 애니메이션을 `motion-safe`로 제한.
- `--shadow-color` CSS 변수를 인라인 `style`로 설정할 때는 `CSSProperties` 타입캐스트 사용.
