// app/reports/[studentId]/page.jsx
import { getStudentReport } from '@/lib/notion';
import StudentReportClient from '@/components/StudentReportClient';

export default async function StudentReportPage({ params }) {
  const studentName = decodeURIComponent(params.studentId).replace(/-/g, ' ');
  const reportMonth = '2026-01';
  
  try {
    const reportData = await getStudentReport(studentName, reportMonth);

    if (!reportData) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">리포트를 찾을 수 없습니다</h1>
            <p className="text-gray-600">
              학생: {studentName}<br/>
              기간: {reportMonth}
            </p>
            <p className="text-gray-500 mt-4 text-sm">
              Notion 데이터베이스에 해당 학생의 보고서가 없습니다.
            </p>
          </div>
        </div>
      );
    }

    return <StudentReportClient reportData={reportData} />;
  } catch (error) {
    console.error('Error loading report:', error);
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-2">오류가 발생했습니다</h1>
          <p className="text-gray-600 mb-4">
            Notion API 연결에 문제가 있습니다.
          </p>
          <div className="bg-white rounded-lg p-4 text-left text-sm text-gray-700">
            <p className="font-semibold mb-2">확인사항:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>.env.local 파일에 API 키가 설정되어 있나요?</li>
              <li>Notion Integration이 데이터베이스에 연결되어 있나요?</li>
              <li>Database ID가 올바른가요?</li>
            </ul>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            에러 메시지: {error.message}
          </p>
        </div>
      </div>
    );
  }
}