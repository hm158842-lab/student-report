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
      // "2026년 1월 김민재" → "김민재" 추출
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

// 학생 성적 가져오기
async function fetchStudentScores(studentName) {
  try {
    const databaseId = process.env.NOTION_SCORE_DATABASE_ID;
    
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          property: '날짜',
          direction: 'ascending',
        },
      ],
    });

    const weeklyScores = [];
    const monthlyScores = [];

    for (const page of response.results) {
      const properties = page.properties;
      
      // 학생 이름 확인 (관계형에서 가져오기)
      let pageStudentName = '';
      if (properties['학생이름']?.relation?.length > 0) {
        try {
          const studentPage = await notion.pages.retrieve({ 
            page_id: properties['학생이름'].relation[0].id 
          });
          pageStudentName = studentPage.properties['학생이름']?.title?.[0]?.plain_text || '';
        } catch (e) {
          console.log('Could not fetch student name from relation');
          continue;
        }
      }

      // 학생 이름이 일치하지 않으면 건너뛰기
      if (!pageStudentName.includes(studentName) && !studentName.includes(pageStudentName)) {
        continue;
      }

      const score = properties['성적']?.number || 0;
      const avgScore = properties['평균수식']?.formula?.number || properties['평균수식']?.rollup?.number || 0;
      const rank = properties['등수']?.formula?.number || properties['등수']?.number || 0;
      const date = properties['날짜']?.date?.start || '';
      
      // 시험지 이름 가져오기
      let examName = properties['연/월']?.title?.[0]?.plain_text || '';
      if (properties['시험지']?.relation?.length > 0) {
        try {
          const examPage = await notion.pages.retrieve({ 
            page_id: properties['시험지'].relation[0].id 
          });
          examName = examPage.properties['이름']?.title?.[0]?.plain_text || examName;
        } catch (e) {
          console.log('Could not fetch exam name');
        }
      }

      const scoreData = {
        id: page.id,
        name: examName,
        score: score,
        avgScore: Math.round(avgScore),
        rank: rank,
        date: date,
      };

      // "월말" 또는 "월평가" 포함하면 월말평가
      if (examName.includes('월말') || examName.includes('월평가')) {
        monthlyScores.push(scoreData);
      } else {
        weeklyScores.push(scoreData);
      }
    }

    return {
      weekly: weeklyScores,
      monthly: monthlyScores,
    };
  } catch (error) {
    console.error('Error fetching student scores:', error);
    return { weekly: [], monthly: [] };
  }
}

// 캐싱된 성적 함수
export const getStudentScores = unstable_cache(
  fetchStudentScores,
  ['student-scores'],
  { revalidate: 3600 }
);

// 학생 보고서 가져오기
async function fetchStudentReport(studentName, reportMonth) {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          {
            property: '제목',
            title: {
              contains: studentName,
            },
          },
          {
            property: '날짜',
            date: {
              on_or_after: reportMonth + '-01',
            },
          },
        ],
      },
    });

    if (response.results.length === 0) {
      return null;
    }

    const page = response.results[0];
    const properties = page.properties;

    // 학생 이름 가져오기
    let actualStudentName = studentName;
    if (properties['재원생DB']?.relation?.length > 0) {
      const studentPageId = properties['재원생DB'].relation[0].id;
      try {
        const studentPage = await notion.pages.retrieve({ page_id: studentPageId });
        actualStudentName = studentPage.properties['학생이름']?.title?.[0]?.plain_text || studentName;
      } catch (error) {
        console.log('Could not fetch student name:', error.message);
      }
    }

    // 날짜 정보
    const reportDate = properties['날짜']?.date?.start || '';
    const [year, month] = reportDate.split('-');

    // 진도현황 파싱
    const progressText = properties['진도현황']?.rich_text?.[0]?.plain_text || '';
    const progressItems = progressText
      .split(/(완료|진행중|진행예정)/)
      .reduce((acc, item) => {
        if (item === '완료' || item === '진행중' || item === '진행예정') {
          if (acc.length > 0) {
            acc[acc.length - 1] = acc[acc.length - 1] + item;
          }
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
      
      let status = 'scheduled';
      if (hasComplete) {
        status = 'completed';
      } else if (hasProgress) {
        status = 'in-progress';
      }
      
      return {
        id: `progress-${index}`,
        subject: subject || item,
        description: '',
        status: status,
      };
    });

    // 출결_자동 수식 데이터 가져오기
    const attendanceData = properties['출결과제_자동']?.formula?.string || '';
    
    // 출결 데이터 파싱
    let attendance = {
      attend: 0,
      late: 0,
      earlyLeave: 0,
      absent: 0,
      makeup: 0,
    };
    
    const attendMatch = attendanceData.match(/-출석:\s*(\d+)회/);
    const lateMatch = attendanceData.match(/-지각:\s*(\d+)회/);
    const earlyMatch = attendanceData.match(/-조퇴:\s*(\d+)회/);
    const absentMatch = attendanceData.match(/-결석:\s*(\d+)회/);
    const makeupMatch = attendanceData.match(/-보강:\s*(\d+)회/);
    
    if (attendMatch) attendance.attend = parseInt(attendMatch[1]);
    if (lateMatch) attendance.late = parseInt(lateMatch[1]);
    if (earlyMatch) attendance.earlyLeave = parseInt(earlyMatch[1]);
    if (absentMatch) attendance.absent = parseInt(absentMatch[1]);
    if (makeupMatch) attendance.makeup = parseInt(makeupMatch[1]);

    // 숙제_자동 수식 데이터 가져오기
    const homeworkData = properties['숙제_자동']?.formula?.string || '0,0';
    const homeworkParts = homeworkData.split(',');
    const homeworkSubmit = parseInt(homeworkParts[0]) || 0;
    const homeworkNotSubmit = parseInt(homeworkParts[1]) || 0;

    // 성적 데이터 가져오기 (캐싱됨)
    const scores = await getStudentScores(studentName);

    return {
      id: page.id,
      studentName: actualStudentName,
      reportMonth: `${year}-${month}`,
      period: `${year}.${month}.01 ~ ${year}.${month}.31`,
      totalClasses: 12,
      summary: properties['학습요약']?.rich_text?.[0]?.plain_text || '',
      progress: progress,
      progressText: progressText,
      homework: {
        submit: homeworkSubmit,
        notSubmit: homeworkNotSubmit,
      },
      attendance: attendance,
      teacherComment: properties['만T코멘트']?.rich_text?.[0]?.plain_text || '',
      scores: scores,
    };
  } catch (error) {
    console.error('Error fetching student report from Notion:', error);
    throw error;
  }
}

// 캐싱된 보고서 함수
export const getStudentReport = unstable_cache(
  fetchStudentReport,
  ['student-report'],
  { revalidate: 3600 }
);