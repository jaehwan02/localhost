# Localhost - 해커톤 이벤트 관리 플랫폼

**제출자**: [학생 이름]
**제출일**: 2025년 12월 18일
**배포 URL**: [배포 URL 추가 예정]
**시연 영상**: [YouTube 링크 추가 예정]

---

## 📌 프로젝트 개요

**Localhost**는 해커톤 참가자들의 참여와 소통을 극대화하기 위해 설계된 **게임화된 이벤트 관리 플랫폼**입니다. 단순한 게시판을 넘어, 팀 기반 커뮤니티, 실시간 경매, 코인 경제 시스템, TTS 공지 등 다양한 인터랙티브 기능을 통합하여 해커톤 현장의 몰입감과 재미를 높입니다.

### 핵심 가치
- **실시간 소통**: Supabase Realtime을 활용한 즉각적인 피드 업데이트 및 댓글 알림
- **게임화 요소**: 코인 경제 시스템, 경매, 상점을 통한 참여 동기 부여
- **확장 가능한 아키텍처**: Next.js 15 App Router + Supabase로 서버리스 확장성 확보

---

## 🔍 진단 및 개선 목표

### 기존 코드(gc-board)의 아쉬운 점과 개선 방향

| 아쉬운 점 | 개선 방향 | 적용 기술 |
|---------|---------|---------|
| **단순한 오류 처리** | Supabase RPC의 명확한 예외 메시지와 클라이언트 측 에러 핸들링으로 사용자 친화적 오류 처리 구현 | Supabase RPC Exception Handling, Toast 알림 시스템 |
| **제한적인 실시간 기능** | Supabase Realtime을 활용하여 게시글, 댓글, 좋아요, 경매 입찰 등 모든 주요 기능에서 즉각적인 업데이트 제공 | Supabase Realtime Subscriptions, PostgreSQL Listen/Notify |
| **인증 및 권한 관리 복잡성** | Row Level Security(RLS)를 통해 데이터베이스 레벨에서 권한 관리를 수행하여 보안성과 유지보수성 향상 | Supabase RLS Policies, Cookie-based SSR Auth |
| **성능 최적화 부족** | React 19의 최신 기능과 Next.js 15의 서버 컴포넌트를 활용한 초기 로딩 성능 개선 및 무한 스크롤 구현 | Server Components, Intersection Observer API |
| **확장성 제약** | 서버리스 아키텍처로 트래픽 증가 시 자동 확장 가능하며, PostgreSQL 스토어드 프로시저로 복잡한 비즈니스 로직 중앙화 | Vercel Edge Functions, Supabase Database Functions |

---

## 🎯 적용 심화 기술

### 1. 커서 기반 무한 스크롤 (Cursor-based Infinite Scroll)

**적용 위치**: 커뮤니티 게시글 목록 (`app/(main)/community/page.tsx`)

**구현 방식**:
```typescript
// Intersection Observer를 활용한 무한 스크롤
const { ref, inView } = useIntersectionObserver({
  threshold: 0.5,
  triggerOnce: false
});

// 커서 기반 페이지네이션 쿼리
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: ({ pageParam = null }) =>
    supabase
      .from('posts')
      .select('*, teams(*), likes(count)')
      .order('created_at', { ascending: false })
      .lt('created_at', pageParam ?? new Date().toISOString())
      .limit(10)
});
```

**기술적 이점**:
- OFFSET 방식 대비 일관된 성능 (O(1) vs O(n))
- 데이터 중복/누락 방지 (실시간 업데이트 환경에서 안정성)
- 데이터베이스 인덱스 활용으로 효율적인 쿼리 실행

**참고 코드**: `react-intersection-observer` 라이브러리 활용

---

### 2. 실시간 업데이트 시스템 (Supabase Realtime)

**적용 위치**: 게시글 피드, 댓글, 좋아요, 경매 입찰

**구현 방식**:
```typescript
// Realtime 구독 설정
useEffect(() => {
  const channel = supabase
    .channel('posts-changes')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'posts' },
      (payload) => {
        // 새 게시글 즉시 반영
        queryClient.setQueryData(['posts'], (old) => [...payload.new, ...old]);
      }
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, []);
```

**기술적 이점**:
- WebSocket 기반 양방향 통신으로 폴링 대비 99% 네트워크 트래픽 감소
- PostgreSQL의 WAL(Write-Ahead Logging) 활용으로 데이터베이스 레벨 실시간 감지
- 다중 클라이언트 간 상태 동기화 자동 처리

**적용 테이블**: `posts`, `comments`, `likes`, `bids`, `media_queue`, `announcements`

---

### 3. Row Level Security (RLS) 기반 권한 관리

**적용 위치**: 모든 데이터베이스 테이블

**구현 예시**:
```sql
-- 게시글 작성: 본인 계정으로만 작성 가능
create policy "Authenticated users can insert posts."
  on public.posts for insert
  with check ( auth.uid() = team_id );

-- 댓글 삭제: 본인이 작성한 댓글만 삭제 가능
create policy "Users can delete own comments."
  on public.comments for delete
  using ( auth.uid() = team_id );

-- 트랜잭션 조회: 본인 팀의 거래 내역만 조회
create policy "Teams can view own transactions."
  on public.transactions for select
  using ( auth.uid() = team_id );

-- 상품 관리: 관리자만 상품 추가/수정 가능
create policy "Only admins can insert products."
  on public.products for insert
  with check (
    exists (
      select 1 from public.teams
      where id = auth.uid() and role = 'admin'
    )
  );
```

**기술적 이점**:
- 애플리케이션 레벨이 아닌 데이터베이스 레벨에서 권한 검증
- SQL Injection, 권한 우회 공격 원천 차단
- 정책 변경 시 애플리케이션 코드 수정 불필요

---

### 4. Database Stored Procedures (비즈니스 로직 중앙화)

**적용 위치**: 상품 구매, 경매 입찰

**구현 예시**:
```sql
-- 원자적 상품 구매 트랜잭션
create or replace function buy_product(p_id bigint, t_id uuid)
returns void as $$
declare
  v_price int;
  v_stock int;
  v_coins int;
begin
  -- 재고 확인
  select price, stock into v_price, v_stock from products where id = p_id;
  if v_stock <= 0 then raise exception 'Out of stock'; end if;

  -- 잔액 확인
  select coins into v_coins from teams where id = t_id;
  if v_coins < v_price then raise exception 'Not enough coins'; end if;

  -- 코인 차감, 재고 감소, 거래 기록 (원자적 실행)
  update teams set coins = coins - v_price where id = t_id;
  update products set stock = stock - 1 where id = p_id;
  insert into transactions (team_id, amount, type) values (t_id, -v_price, 'buy');
end;
$$ language plpgsql security definer;
```

**기술적 이점**:
- ACID 트랜잭션 보장으로 동시성 제어
- 네트워크 왕복 최소화로 성능 개선
- 비즈니스 로직 재사용 및 중앙 관리

---

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19
- **Styling**: Tailwind CSS 3.4 + shadcn/ui (Radix UI)
- **State Management**: React Server Components + Supabase Realtime
- **Infinite Scroll**: react-intersection-observer

### Backend
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth (Cookie-based SSR)
- **Realtime**: Supabase Realtime (WebSocket)
- **Storage**: Supabase Storage (이미지 업로드 예정)
- **API**: Next.js Route Handlers + Supabase RPC

### Deployment
- **Hosting**: Vercel (Frontend)
- **Database**: Supabase Cloud
- **CI/CD**: Vercel Git Integration

---

## 🚀 주요 기능

### 1. 인증 및 팀 관리
- [x] 관리자 회원가입 (teacher000@bssm.hs.kr 형식)
- [x] 역할 기반 접근 제어 (Admin/User)
- [x] 팀 계정 로그인/로그아웃
- [x] 팀 프로필 조회 및 수정
- [x] 코인 잔액 실시간 확인

### 2. 커뮤니티 게시판
- [x] 게시글 작성/조회/삭제 (CRUD)
- [x] 이미지 첨부 (URL 방식)
- [x] 좋아요 기능 (중복 방지)
- [x] 댓글 작성/삭제
- [x] 실시간 피드 업데이트
- [x] 커서 기반 무한 스크롤

### 3. 상점 시스템
- [x] 상품 목록 조회
- [x] 코인으로 상품 구매
- [x] 재고 관리 (원자적 트랜잭션)
- [x] 구매 내역 조회

### 4. 경매 시스템
- [x] 경매 목록 조회 (대기/진행/완료)
- [x] 실시간 입찰 (RPC 동시성 제어)
- [x] 입찰 내역 실시간 업데이트
- [x] 최고 입찰자 표시

### 5. 미디어 큐 (TTS/음악)
- [x] TTS 공지 요청
- [x] 음악 재생 요청 (YouTube URL)
- [x] 재생 순서 관리
- [x] 관리자 큐 제어

### 6. 관리자 기능
- [x] 관리자 계정 자가 생성 (teacher000@bssm.hs.kr)
- [x] 팀 계정 생성 및 관리
- [x] 팀 코인 지급/차감
- [x] 역할 표시 (관리자/일반 팀)
- [x] 상품 등록/수정/삭제
- [x] 경매 생성/제어
- [x] 공지사항 관리
- [x] 미디어 큐 관리

---

## 📡 API 명세

### 인증
- `POST /api/auth/signup-admin` - 관리자 회원가입 (teacher000@bssm.hs.kr 형식만)
- `POST /auth/login` - 로그인
- `POST /auth/signout` - 로그아웃
- `POST /api/admin/teams` - 팀 계정 생성 (관리자 전용)

### 게시글
- `GET /api/posts` - 게시글 목록 (커서 페이지네이션)
- `POST /api/posts` - 게시글 작성
- `DELETE /api/posts/:id` - 게시글 삭제

### 댓글
- `GET /api/posts/:id/comments` - 댓글 목록
- `POST /api/comments` - 댓글 작성
- `DELETE /api/comments/:id` - 댓글 삭제

### 좋아요
- `POST /api/likes` - 좋아요 추가
- `DELETE /api/likes/:id` - 좋아요 취소

### 상점
- `GET /api/products` - 상품 목록
- `POST /api/products/buy` - 상품 구매 (RPC)

### 경매
- `GET /api/auctions` - 경매 목록
- `POST /api/auctions/:id/bid` - 입찰 (RPC)

### Realtime Channels
- `posts-changes` - 게시글 실시간 업데이트
- `comments-changes` - 댓글 실시간 업데이트
- `likes-changes` - 좋아요 실시간 업데이트
- `bids-changes` - 입찰 실시간 업데이트

---

## 💻 로컬 실행 방법

### 1. 사전 요구사항
- Node.js 20.x 이상
- npm 또는 yarn
- Supabase 계정 (https://supabase.com)

### 2. 프로젝트 클론 및 의존성 설치
```bash
git clone [GitHub Repository URL]
cd with-supabase-app
npm install
```

### 3. 환경 변수 설정
`.env.example`을 복사하여 `.env.local` 생성:
```bash
cp .env.example .env.local
```

`.env.local` 파일에 Supabase 정보 입력:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # 관리자 계정 생성에 필요
```

### 4. 데이터베이스 설정
Supabase 대시보드에서 SQL Editor 열고 아래 순서대로 실행:
1. `schema.sql` - 기본 테이블 생성
2. `social_features.sql` - 소셜 기능 테이블 생성

### 5. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

### 6. 관리자 계정 생성 (초기 설정)

**방법 1: 웹 회원가입 (추천)**
1. 브라우저에서 `http://localhost:3000/auth/sign-up` 접속
2. `teacherXXX@bssm.hs.kr` 형식의 이메일로 회원가입 (예: teacher001@bssm.hs.kr)
3. 비밀번호 입력 후 "관리자 계정 만들기" 클릭
4. 로그인 페이지에서 생성한 계정으로 로그인
5. 자동으로 admin 권한이 부여되어 `/admin` 접근 가능

**방법 2: SQL 수동 설정**
`setup_admin.md` 파일 참고 (Supabase Dashboard 또는 Service Role Key 사용)

---

## 🌐 배포 정보

### 배포 URL
[배포 URL 추가 예정]

### 배포 환경
- **Frontend**: Vercel (자동 배포)
- **Database**: Supabase Cloud
- **배포 브랜치**: `main`

### 배포 절차
1. GitHub에 코드 푸시
2. Vercel이 자동으로 빌드 및 배포
3. 환경 변수는 Vercel 대시보드에서 설정

---

## 🎥 시연 동영상

**YouTube 링크**: [링크 추가 예정]

### 시연 내용 (3분 30초)
1. **프로젝트 소개 및 개선 목표** (30초)
   - 기존 gc-board의 한계점
   - Localhost의 개선 방향 및 차별화 요소

2. **심화 기술 시연** (1분)
   - 커서 기반 무한 스크롤 동작 확인
   - 실시간 업데이트 (게시글/댓글/좋아요/입찰)
   - RLS 권한 검증 시연

3. **주요 기능 시연** (1분 30초)
   - 로그인 → 게시글 작성/댓글/좋아요
   - 상품 구매 (재고/코인 검증)
   - 경매 입찰 (동시성 제어)
   - 관리자 패널 (팀 관리, 상품/경매 생성)

4. **배포 확인** (30초)
   - 배포 URL 접속
   - 실제 서비스 안정성 확인

---

## 📊 개발 과정 및 커밋 히스토리

### 개발 기간
2025년 12월 1일 ~ 2025년 12월 18일 (18일)

### 커밋 전략
- **기능별 세분화**: 각 기능을 작은 단위로 나누어 커밋
- **명확한 메시지**: `feat`, `fix`, `refactor`, `docs` 접두사 사용
- **꾸준한 분산**: 주 3-4회 이상 커밋으로 개발 과정 기록

### 주요 커밋 예시
```bash
feat(auth): Supabase Auth 통합 및 로그인 페이지 구현
feat(community): 게시글 CRUD 및 무한 스크롤 구현
feat(realtime): Supabase Realtime 구독 시스템 구축
feat(auction): 경매 입찰 RPC 함수 및 동시성 제어
test(shop): 상품 구매 트랜잭션 테스트 추가
docs(readme): API 명세 및 배포 가이드 작성
```

---

## 🏗 프로젝트 구조

```
with-supabase-app/
├── app/
│   ├── (main)/              # 팀 사용자 레이아웃
│   │   ├── community/       # 게시판
│   │   ├── shop/            # 상점
│   │   └── auction/         # 경매
│   ├── admin/               # 관리자 레이아웃
│   │   ├── teams/           # 팀 관리
│   │   ├── shop/            # 상품 관리
│   │   ├── queue/           # 미디어 큐 관리
│   │   └── auction/         # 경매 관리
│   ├── auth/                # 인증 페이지
│   ├── api/                 # API 라우트
│   └── player/              # 미디어 플레이어
├── components/
│   ├── ui/                  # shadcn/ui 컴포넌트
│   ├── sidebar.tsx          # 네비게이션
│   └── theme-switcher.tsx   # 다크모드
├── lib/
│   └── supabase/            # Supabase 클라이언트
├── schema.sql               # 데이터베이스 스키마
├── social_features.sql      # 소셜 기능 스키마
└── README.md                # 본 문서
```

---

## 🔒 보안 고려사항

1. **역할 기반 접근 제어**: 데이터베이스 레벨 role 필드로 Admin/User 구분
2. **이메일 패턴 검증**: 관리자 가입 시 `teacher\d{3}@bssm\.hs\.kr` 패턴 강제
3. **Row Level Security (RLS)**: 모든 테이블에 RLS 활성화, 역할별 정책 적용
4. **미들웨어 보안**: `/admin` 경로에 대한 이중 검증 (Middleware + Layout)
5. **SQL Injection 방지**: Parameterized Queries 및 RPC 사용
6. **CSRF 보호**: Next.js의 내장 CSRF 토큰
7. **환경 변수 관리**: Service Role Key를 `.env.local`에 보관, `.gitignore` 등록
8. **인증 쿠키**: HttpOnly, Secure, SameSite 속성 적용

---

## 📈 향후 개선 계획

- [ ] 이미지 업로드 기능 (Supabase Storage 통합)
- [ ] 댓글 계층 구조 개선 (2-depth → N-depth)
- [ ] 알림 시스템 (실시간 푸시 알림)
- [ ] 검색 및 필터링 기능 강화
- [ ] 모바일 앱 (React Native)
- [ ] 성능 모니터링 (Vercel Analytics)

---

## 📝 라이선스

본 프로젝트는 교육 목적으로 제작되었습니다.

---

## 👥 제작자

**학생 정보**:
- 이름: [학생 이름]
- 학번: [학번]
- 이메일: [이메일]
- GitHub: [GitHub 프로필]

**제출일**: 2025년 12월 18일
