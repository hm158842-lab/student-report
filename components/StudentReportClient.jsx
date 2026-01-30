'use client';

import { useState, useEffect } from 'react';

export default function StudentReportClient({ studentId }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. API에서 데이터 가져오기
    fetch(`/api/reports/${studentId}`)
      .then((res) => {
        if (!res.ok) throw new Error('레포트를 찾을 수 없습니다.');
        return res.json();
      })
      .then((data) => {
        setReport(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [studentId]);

  // 2. 로딩 중일 때 화면
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">데이터를 불러오는 중입니다...</p>
      </div>
    </div>
  );

  // 3. 에러 났을 때 화면
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">오류 발생</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    </div>
  );

  // 4. 레포트 화면 (성공!)
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* 상단 헤더 (제목) */}
        <div className="bg-indigo-600 px-8 py-10 text-white text-center">
          <h1 className="text-3xl font-bold mb-2">{report.studentName} 학생</h1>
          <p className="text-indigo-100 text-lg">{report.reportMonth} 학습 분석 리포트</p>
        </div>

        <div className="p-8 space-y-8">
          
          {/* 1. 학습 요약 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-2">📝</span>
              학습 요약
            </h2>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {report.summary}
              </p>
            </div>
          </section>

          {/* 2. 선생님 코멘트 (수정한 부분!) */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="bg-red-100 text-red-600 p-2 rounded-lg mr-2">💬</span>
              선생님 코멘트
            </h2>
            <div className="bg-red-50 rounded-xl p-6 shadow-sm border border-red-100">
              {/* 제목 변경: 담당 선생님 -> 만티가 드리는 말씀 */}
              <p className="text-sm text-red-600 font-medium mb-2">만티가 드리는 말씀</p>
              
              {/* 줄바꿈 적용: whitespace-pre-wrap 추가 */}
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {report.teacherComment}
              </p>
            </div>
          </section>

          {/* 3. 진도 현황 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="bg-green-100 text-green-600 p-2 rounded-lg mr-2">📚</span>
              진도 현황
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.progress.map((item, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                  <span className="font-medium text-gray-700">{item.subject}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium
                    ${item.status === 'completed' ? 'bg-blue-100 text-blue-700' : 
                      item.status === 'in-progress' ? 'bg-green-100 text-green-700' : 
                      'bg-gray-100 text-gray-600'}`}>
                    {item.status === 'completed' ? '완료' : 
                     item.status === 'in-progress' ? '진행중' : '예정'}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* 4. 출결 및 과제 */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 출결 */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-yellow-100 text-yellow-600 p-2 rounded-lg mr-2">⏰</span>
                출결 현황
              </h2>
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">{report.attendance.attend}</div>
                    <div className="text-xs text-gray-500">출석</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-red-500">{report.attendance.late + report.attendance.absent}</div>
                    <div className="text-xs text-gray-500">지각/결석</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 과제 */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-purple-100 text-purple-600 p-2 rounded-lg mr-2">✏️</span>
                과제 수행
              </h2>
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">제출률</span>
                  <span className="font-bold text-indigo-600">
                    {Math.round((report.homework.submit / (report.homework.submit + report.homework.notSubmit || 1)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${(report.homework.submit / (report.homework.submit + report.homework.notSubmit || 1)) * 100}%` }}
                  ></div>
                </div>
                <div className="mt-4 flex justify-between text-sm text-gray-500">
                  <span>제출 {report.homework.submit}회</span>
                  <span>미제출 {report.homework.notSubmit}회</span>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}