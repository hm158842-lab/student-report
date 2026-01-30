# 학생 학습 보고서 시스템

Next.js, Tailwind CSS, Notion API를 활용한 학생별 맞춤 학습 리포트 페이지입니다.

## 🎨 디자인 특징

- **Red Theme**: 전체적으로 빨간색 계열의 디자인 시스템 적용
- **그라디언트 헤더**: 붉은색 그라디언트로 시선을 사로잡는 헤더
- **부드러운 애니메이션**: 페이지 로드 시 순차적으로 나타나는 섹션들
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 모두 지원

## 🚀 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Data**: Notion API (@notionhq/client)
- **Font**: Pretendard (한글 최적화 폰트)

## 📦 설치 방법

### 1. 프로젝트 설정

```bash
# 의존성 설치
npm install

# 또는 yarn 사용
yarn install
```

### 2. 환경 변수 설정

`.env.local.example` 파일을 `.env.local`로 복사하고 실제 값으로 수정하세요:

```bash
cp .env.local.example .env.local
```

`.env.local` 파일 내용:
```env
NOTION_API_KEY=your_notion_api_key_here
NOTION_DATABASE_ID=your_database_id_here
```

### 3. Notion API 설정

#### Notion Integration 생성
1. [Notion Integrations](https://www.notion.so/my-integrations) 페이지 방문
2. "New integration" 클릭
3. 이름 입력 후 생성
4. "Internal Integration Token" 복사 → `.env.local`의 `NOTION_API_KEY`에 붙여넣기

#### Notion Database 설정
1. Notion에서 학습 보고서용 데이터베이스 생성
2. 데이터베이스에 다음 속성(Properties) 추가:

| 속성 이름 | 타입 | 설명 |
|---------|------|------|
| StudentId | Text | 학생 고유 ID |
| StudentName | Title | 학생 이름 |
| ReportMonth | Date | 보고서 월 (YYYY-MM) |
| Period | Text | 수업 기간 |
| TotalClasses | Number | 총 수업 횟수 |
| Summary | Text | 학습 요약 |
| Progress | Multi-select | 진도 현황 |
| Tasks | Relation | 과제 수행 현황 (다른 DB와 연결) |
| TeacherComment | Text | 선생님 코멘트 |
| AttendanceTotalDays | Number | 총 출석 일수 |
| AttendanceDetails | Text | 출결 상세 내용 |
| AttendanceWarning | Text | 출결 경고 메시지 |

3. 데이터베이스 우측 상단 "•••" 클릭 → "Add connections" → 생성한 Integration 선택
4. 데이터베이스 URL에서 ID 복사:
   - URL: `https://notion.so/workspace/abc123...?v=...`
   - Database ID: `abc123...` 부분 → `.env.local`의 `NOTION_DATABASE_ID`에 붙여넣기

### 4. 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
```

브라우저에서 [http://localhost:3000/reports/student001](http://localhost:3000/reports/student001) 접속

## 📁 프로젝트 구조

```
student-report-app/
├── app/
│   ├── layout.jsx              # 루트 레이아웃
│   ├── globals.css             # 글로벌 스타일
│   └── reports/
│       └── [studentId]/
│           └── page.jsx        # 학생 리포트 페이지 (서버 컴포넌트)
├── components/
│   └── StudentReportClient.jsx # 클라이언트 컴포넌트 (애니메이션 포함)
├── lib/
│   └── notion.js               # Notion API 유틸리티
├── .env.local.example          # 환경 변수 템플릿
├── tailwind.config.js          # Tailwind 설정
└── package.json
```

## 🎯 주요 기능

### 1. 동적 라우팅
- URL: `/reports/[studentId]`
- 학생 ID별로 개별 리포트 페이지 생성

### 2. 섹션 구성
- **헤더**: 학생 정보, 보고서 기간, 수업 횟수
- **학습 요약**: 한 달 학습 내용 요약
- **진도 현황**: 과목별 학습 진행 상태
- **과제 수행 현황**: 날짜별 과제 완료 상태
- **선생님 코멘트**: 담당 선생님의 상세 피드백
- **출결 안내**: 출석/결석 정보 및 보강 안내

### 3. 상태 배지
- **완료**: 초록색 (bg-green-100, text-green-700)
- **미확인**: 노란색 (bg-yellow-100, text-yellow-700)
- **확인 예정**: 주황색 (bg-orange-100, text-orange-700)
- **진행 예정**: 빨간색 (bg-red-100, text-red-700)

## 🔧 커스터마이징

### 색상 테마 변경
`tailwind.config.js`에서 primary 색상 팔레트 수정:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // 원하는 색상으로 변경
        600: '#your-color',
      },
    },
  },
}
```

### 애니메이션 조정
`components/StudentReportClient.jsx`에서 `delay-{number}` 값 수정:

```javascript
className={`transition-all duration-700 delay-100 ${...}`}
// delay-100, delay-200, delay-300 등으로 조정
```

## 📝 데이터 구조 예시

```javascript
{
  studentName: "성정민",
  reportMonth: "2026-01",
  period: "2026.01.01 ~ 2026.01.31",
  totalClasses: 12,
  summary: "학습 요약 내용...",
  progress: [
    {
      subject: "이차함수",
      description: "이차함수의 그래프와 최댓값, 최솟값",
      status: "completed"
    }
  ],
  tasks: [
    {
      date: "12/01",
      content: "교재 끝까지",
      status: "completed"
    }
  ],
  teacherComment: "선생님 코멘트...",
  attendanceAlert: {
    totalDays: 12,
    totalAbsent: 2,
    details: "12월 18일, 22일 병결 (총 2회)",
    warning: "1월 토요일 보강 수업 예정"
  }
}
```

## 🚀 프로덕션 배포

### Vercel 배포 (권장)

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 환경 변수 설정
vercel env add NOTION_API_KEY
vercel env add NOTION_DATABASE_ID
```

### 빌드

```bash
npm run build
npm start
```

## 📖 사용 팁

1. **Mock 데이터로 개발하기**: 
   - `lib/notion.js`의 `getMockStudentReport()` 함수 사용
   - Notion 설정 없이 바로 UI 테스트 가능

2. **실제 데이터 연동하기**:
   - `app/reports/[studentId]/page.jsx`에서 주석 처리된 부분 활성화
   - `getMockStudentReport()` → `getStudentReport(params.studentId, '2026-01')` 변경

3. **다국어 지원 추가**:
   - `next-intl` 패키지 사용 권장
   - 각 텍스트를 번역 키로 대체

## 🐛 트러블슈팅

### Notion API 연결 오류
- Integration이 데이터베이스에 연결되어 있는지 확인
- API Key가 올바른지 확인
- 데이터베이스 ID가 정확한지 확인

### 스타일이 적용되지 않음
- `npm run dev` 재시작
- 브라우저 캐시 삭제
- `tailwind.config.js`의 content 경로 확인

## 📄 라이선스

MIT License

## 🤝 기여

이슈나 풀 리퀘스트는 언제나 환영합니다!

---

**Made with ❤️ using Next.js and Tailwind CSS**
