# AI 워크샵 참가 신청 시스템

Next.js + SQLite 기반의 설문조사/참가 신청 폼 및 관리자 페이지입니다.

---

## 프로젝트 구조

```
aisample1/
├── data/                          # SQLite DB 파일 저장 (자동 생성)
│   └── survey.db
├── src/
│   ├── app/
│   │   ├── page.tsx               # 메인 신청 폼 (사용자)
│   │   ├── success/page.tsx       # 신청 완료 페이지
│   │   ├── layout.tsx             # 루트 레이아웃
│   │   ├── globals.css
│   │   ├── admin/
│   │   │   ├── layout.tsx         # 어드민 공통 레이아웃 (네비게이션)
│   │   │   ├── page.tsx           # 어드민 대시보드 (통계)
│   │   │   ├── login/page.tsx     # 어드민 로그인
│   │   │   └── submissions/
│   │   │       ├── page.tsx       # 신청 목록 (검색/필터/페이지네이션)
│   │   │       └── [id]/page.tsx  # 신청 수정/삭제
│   │   └── api/
│   │       ├── submissions/
│   │       │   ├── route.ts       # GET(목록), POST(신청)
│   │       │   └── [id]/route.ts  # GET, PUT(수정), DELETE
│   │       ├── stats/route.ts     # 통계 API
│   │       └── auth/
│   │           ├── login/route.ts
│   │           └── logout/route.ts
│   ├── lib/
│   │   └── db.ts                  # SQLite 연결 및 스키마 초기화
│   └── types/
│       └── index.ts               # 공통 타입 정의
├── middleware.ts                  # 어드민 인증 미들웨어
├── .env.local                     # 환경 변수 (비밀번호 설정)
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 데이터베이스 스키마

```sql
CREATE TABLE submissions (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT NOT NULL,          -- 이름
  email           TEXT NOT NULL,          -- 이메일
  phone           TEXT,                   -- 연락처
  affiliation     TEXT,                   -- 소속
  age_group       TEXT,                   -- 나이대
  gender          TEXT,                   -- 성별
  purpose         TEXT,                   -- 참가 목적
  ai_experience   TEXT,                   -- AI 활용 경험
  interest_areas  TEXT,                   -- 관심 분야 (JSON 배열)
  comments        TEXT,                   -- 추가 의견
  status          TEXT DEFAULT 'pending', -- 상태: pending|approved|rejected
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 페이지 구성

| URL | 설명 |
|-----|------|
| `/` | 참가 신청 폼 (사용자) |
| `/success` | 신청 완료 안내 |
| `/admin` | 어드민 대시보드 (통계, 최근 신청) |
| `/admin/login` | 어드민 로그인 |
| `/admin/submissions` | 신청 목록 (검색/필터/페이지네이션) |
| `/admin/submissions/[id]` | 신청 내역 수정/삭제 |

---

## 어드민 기능

- **대시보드**: 전체/대기/승인/반려 건수 카드, 성별·나이대·목적·AI경험 분포 막대 차트, 최근 5건 미리보기
- **신청 목록**: 이름·이메일 검색, 상태 필터, 페이지네이션
- **신청 수정**: 모든 필드 수정 가능, 상태 변경(대기/승인/반려), 삭제

---

## Windows 실행 방법

### 사전 요구사항

- **Node.js 22.x 이상** (권장: 24.x LTS) — https://nodejs.org 에서 LTS 버전 다운로드
- Node.js 설치 확인:
  ```powershell
  node -v   # v22.x 또는 v24.x 이상이어야 함
  npm -v
  ```

> **참고**: 이 프로젝트는 Node.js 내장 `node:sqlite` 모듈을 사용하므로
> 별도의 빌드 도구(Python, Visual Studio)가 필요 없습니다.

---

### 설치 및 실행

#### 1. 패키지 설치

```powershell
cd C:\GoodRich\_AIWS\aisample1
npm install
```

#### 2. 환경 변수 확인

`.env.local` 파일이 프로젝트 루트에 있어야 합니다.
기본값으로 생성되어 있으며, 필요 시 수정하세요:

```env
# 어드민 로그인 비밀번호
ADMIN_PASSWORD=admin1234

# 어드민 세션 토큰 (보안을 위해 변경하세요)
ADMIN_SECRET=survey-admin-secret-token-2024
```

#### 3. 개발 서버 실행

```powershell
npm run dev
```

브라우저에서 아래 주소로 접속하세요:

| 주소 | 설명 |
|------|------|
| http://localhost:3000 | 신청 폼 |
| http://localhost:3000/admin | 어드민 (비밀번호: `admin1234`) |

---

### 프로덕션 빌드 및 실행

```powershell
# 빌드
npm run build

# 서버 시작
npm start
```

---

## 주요 기술 스택

| 항목 | 버전/내용 |
|------|-----------|
| Next.js | 14.x (App Router) |
| React | 18.x |
| TypeScript | 5.x |
| SQLite | `node:sqlite` (Node.js 22+ 내장 모듈, 별도 설치 불필요) |
| 스타일 | Tailwind CSS 3.x |
| 인증 | 쿠키 기반 세션 (HttpOnly) |

> **Node.js 요구사항**: `node:sqlite`는 Node.js 22.5.0+ 내장 모듈입니다.
> Node.js 24에서 stable 상태이며 별도 npm 패키지가 필요 없습니다.

---

## 어드민 인증 방식

- `middleware.ts`가 `/admin/**` 경로를 보호합니다.
- 로그인 시 `POST /api/auth/login`이 비밀번호를 검증하고 `admin_auth` 쿠키를 설정합니다.
- 미들웨어는 쿠키 값과 `ADMIN_SECRET` 환경 변수를 비교하여 인가합니다.
- 쿠키는 `httpOnly`, `sameSite: strict`로 설정되어 보안을 강화합니다.

---

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/submissions` | 목록 조회 (`?page=&limit=&status=&search=`) |
| POST | `/api/submissions` | 신규 신청 접수 |
| GET | `/api/submissions/:id` | 단건 조회 |
| PUT | `/api/submissions/:id` | 수정 |
| DELETE | `/api/submissions/:id` | 삭제 |
| GET | `/api/stats` | 통계 데이터 |
| POST | `/api/auth/login` | 어드민 로그인 |
| POST | `/api/auth/logout` | 어드민 로그아웃 |

---

## 트러블슈팅

### `node:sqlite` 모듈 오류
Node.js 버전이 22.5.0 미만인 경우 발생합니다. Node.js를 업그레이드하세요:
```powershell
node -v  # 현재 버전 확인
```
https://nodejs.org 에서 최신 LTS(22.x 또는 24.x)를 다운로드하세요.

### 포트 충돌
3000 포트 사용 중인 경우:
```powershell
npm run dev -- -p 3001
```

### DB 초기화
`data/survey.db` 파일을 삭제하면 데이터베이스가 초기화됩니다.
```powershell
Remove-Item -Path "data\survey.db" -ErrorAction SilentlyContinue
```
