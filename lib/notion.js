// lib/notion.js
import { Client } from '@notionhq/client';
import { unstable_cache } from 'next/cache';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// 모든 학생 목록 가져오기
export async function getAllStudents() {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    
    const response = await notion.databases.query({
      database_id: databaseId,
    });

    const students = [];
    
    for (const page of response.results) {
      const title = page.properties['제목']?.title?.[0]?.plain_text || '';
      const match = title.match(/\d+년\s*\d+월\s*(.+)/);
      if (match && match[1]) {
        const name = match[1].trim();
        if (!students.includes(name)) {
          students.push(name);
        }
      }
    }
    
    return students;
  } catch (error) {
    console.error('Error fetching students:', error);
    return [];
  }
}

// 학생 성적 가져오기 (최적화)
async function fetchStudentScores(studentName) {
  try {
    const databaseId = process.env.NOTION_SCORE_DATABASE_ID;
    
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        { property: '날짜', direction: 'ascending' },
      ],
    });

    // 모든 관계형 데이터를 병렬로 가져오기
    const pagePromises = response.results.map(async (page) => {
      const properties = page.properties;
      
      // 학생 이름과 시험지 이름 병렬 조회
      const [studentInfo, examInfo] = await Promise.all([
        properties['학생이름']?.relation?.length > 0
          ? notion.pages.retrieve({ page_id: properties['학생이름'].relation[0].id }).catch(() => null)
          : Promise.resolve(null),
        properties['시험지']?.relation?.length > 0
          ? notion.pages.retrieve({ page_id: properties['시험지'].relation[0].id }).catch(() => null)
          : Promise.resolve(null),
      ]);

      const pageStudentName = studentInfo?.properties['학생이름']?.title?.[0]?.plain_text || '';
      
      // 학생 이름 불일치면 null 반환
      if (!pageStudentName.includes(studentName) && !studentName.includes(pageStudentName)) {
        return null;
      }

      const examName = examInfo?.properties['이름']?.title?.[0]?.plain_text || 
                       properties['연/월']?.title?.[0]?.plain_text || '';

      return {
        id: page.id,
        name: examName,
        score: properties['성적']?.number || 0,
        avgScore: Math.round(properties['평균수식']?.formula?.number || 0),
        rank: properties['등수']?.formula?.number || properties['등수']?.number || 0,
        date: properties['날짜']?.date?.start || '',
        isMonthly: examName.includes('월말') || examName.includes('월평가'),
      };
    });

    const results = await Promise.all(pagePromises);
    const validResults = results.filter(r => r !== null);

    return {
      weekly: validResults.filter(r => !r.isMonthly),
      monthly: validResults.filter(r => r.isMonthly),
    };
  } catch (error) {
    console.error('Error fetching student scores:', error);
    return { weekly: [], monthly: [] };
  }
}

// 캐싱된 성적 함수 (10분)
export const getStudentScores = unstable_cache(
  fetchStudentScores,
  ['student-scores'],
  { revalidate: 600 }
);

// 학생 보고서 가져오기 (최적화)
async function fetchStudentReport(studentName, reportMonth) {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          { property: '제목', title: { contains: studentName } },
          { property: '날짜', date: { on_or_after: reportMonth + '-01' } },
        ],
      },
    });

    if (response.results.length === 0) {
      return null;
    }

    const page = response.results[0];
    const properties = page.properties;

    // 학생 이름 + 성적 데이터 병렬로 가져오기
    const [studentInfo, scores] = await Promise.all([
      properties['재원생DB']?.relation?.length > 0
        ? notion.pages.retrieve({ page_id: properties['재원생DB'].relation[0].id }).catch(() => null)
        : Promise.resolve(null),
      getStudentScores(studentName),
    ]);

    const actualStudentName = studentInfo?.properties['학생이름']?.title?.[0]?.plain_text || studentName;

    // 날짜 정보
    const reportDate = properties['날짜']?.date?.start || '';
    const [year, month] = reportDate.split('-');

    // 진도현황 파싱
    const progressText = properties['진도현황']?.rich_text?.[0]?.plain_text || '';
    const progressItems = progressText
      .split(/(완료|진행중|진행예정)/)
      .reduce((acc, item) => {
        if (item === '완료' || item === '진행중' || item === '진행예정') {
          if (acc.length > 0) acc[acc.length - 1] = acc[acc.length - 1] + item;
        } else if (item.trim()) {
          acc.push(item.trim());
        }
        return acc;
      }, [])
      .filter(item => item.trim());

    const progress = progressItems.map((item, index) => {
      const hasComplete = item.includes('완료');
      const hasProgress = item.includes('진행중');
      const subject = item.replace(/(완료|진행중|진행예정)/g, '').trim();
      
      return {
        id: `progress-${index}`,
        subject: subject || item,
        description: '',
        status: hasComplete ? 'completed' : hasProgress ? 'in-progress' : 'scheduled',
      };
    });

    // 출결 데이터 파싱
    const attendanceData = properties['출결과제_자동']?.formula?.string || '';
    const attendance = {
      attend: parseInt(attendanceData.match(/-출석:\s*(\d+)회/)?.[1] || 0),
      late: parseInt(attendanceData.match(/-지각:\s*(\d+)회/)?.[1] || 0),
      earlyLeave: parseInt(attendanceData.match(/-조퇴:\s*(\d+)회/)?.[1] || 0),
      absent: parseInt(attendanceData.match(/-결석:\s*(\d+)회/)?.[1] || 0),
      makeup: parseInt(attendanceData.match(/-보강:\s*(\d+)회/)?.[1] || 0),
    };

    // 숙제 데이터 파싱
    const homeworkData = properties['숙제_자동']?.formula?.string || '0,0';
    const [homeworkSubmit, homeworkNotSubmit] = homeworkData.split(',').map(n => parseInt(n) || 0);

    return {
      id: page.id,
      studentName: actualStudentName,
      reportMonth: `${year}-${month}`,
      period: `${year}.${month}.01 ~ ${year}.${month}.31`,
      totalClasses: 12,
      summary: properties['학습요약']?.rich_text?.[0]?.plain_text || '',
      progress,
      progressText,
      homework: { submit: homeworkSubmit, notSubmit: homeworkNotSubmit },
      attendance,
      teacherComment: properties['만T코멘트']?.rich_text?.[0]?.plain_text || '',
      scores,
    };
  } catch (error) {
    console.error('Error fetching student report from Notion:', error);
    throw error;
  }
}

// 캐싱된 보고서 함수 (10분)
export const getStudentReport = unstable_cache(
  fetchStudentReport,
  ['student-report'],
  { revalidate: 600 }
);