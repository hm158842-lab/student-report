// components/StudentReportClient.jsx

'use client';

import { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  MessageSquare,
  BarChart3,
  TrendingUp
} from 'lucide-react';

export default function StudentReportClient({ reportData }) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('report');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-block px-2 py-1 md:px-3 text-xs md:text-sm font-medium text-green-700 bg-green-100 rounded-full whitespace-nowrap">
            완료
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-block px-2 py-1 md:px-3 text-xs md:text-sm font-medium text-blue-700 bg-blue-100 rounded-full whitespace-nowrap">
            진행중
          </span>
        );
      default:
        return (
          <span className="inline-block px-2 py-1 md:px-3 text-xs md:text-sm font-medium text-gray-700 bg-gray-100 rounded-full whitespace-nowrap">
            진행 예정
          </span>
        );
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const renderBarChart = (scores, title) => {
    if (!scores || scores.length === 0) {
      return (
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-center text-sm md:text-base">{title} 데이터가 없습니다.</p>
        </div>
      );
    }

    const maxScore = 100;

    return (
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4 md:mb-6 text-base md:text-lg">{title}</h3>
        <div className="space-y-4">
          {scores.map((item, index) => (
            <div key={item.id || index} className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm gap-1">
                <span className="text-gray-700 font-bold text-sm md:text-base">{item.name}</span>
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                  <span className="text-gray-400 text-xs">평균 {item.avgScore}점</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800 text-sm md:text-base">{item.score}점</span>
                    {item.rank && (
                      <span className="text-xs text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded">
                        ({item.rank}등)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-4 md:h-6 relative overflow-hidden">
                <div
                  className={`h-full rounded-full ${getScoreColor(item.score)} transition-all duration-1000 ease-out`}
                  style={{ width: `${(item.score / maxScore) * 100}%` }}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] md:text-xs font-bold text-white drop-shadow-sm">
                    {item.score}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 총 출석 횟수 계산
  const totalAttendance = reportData.attendance?.attend || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-10">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-red-600 to-red-500 text-white py-6 px-4 md:py-8 shadow-md">
        <div className="max-w-4xl mx-auto">
          <h1 
            className={`text-xl md:text-3xl font-bold text-center mb-3 md:mb-4 transition-all duration-700 leading-tight ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            {reportData.reportMonth?.split('-')[0]}년 {reportData.reportMonth?.split('-')[1]}월<br className="md:hidden"/> 학습 보고서 - 만티반
          </h1>
          <div 
            className={`flex flex-wrap justify-center gap-3 md:gap-8 text-xs md:text-base transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="bg-white/10 px-2 py-1 md:px-0 md:py-0 rounded flex items-center gap-1.5 md:gap-2">
              <User size={14} className="md:w-[18px] md:h-[18px]" />
              <span>{reportData.studentName}</span>
            </div>
            <div className="bg-white/10 px-2 py-1 md:px-0 md:py-0 rounded flex items-center gap-1.5 md:gap-2">
              <Calendar size={14} className="md:w-[18px] md:h-[18px]" />
              <span>{reportData.period}</span>
            </div>
            <div className="bg-white/10 px-2 py-1 md:px-0 md:py-0 rounded flex items-center gap-1.5 md:gap-2">
              <BookOpen size={14} className="md:w-[18px] md:h-[18px]" />
              <span>총 출석 {totalAttendance}회</span>
            </div>
          </div>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div className="max-w-4xl mx-auto px-4 -mt-4 md:pt-6 relative z-10">
        <div className="flex gap-1 md:gap-2 bg-white rounded-xl p-1.5 md:p-2 shadow-lg border border-gray-100 overflow-hidden">
          <button
            onClick={() => setActiveTab('report')}
            className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2 md:py-3 px-2 md:px-4 rounded-lg font-medium text-xs md:text-base transition-all ${
              activeTab === 'report'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <BookOpen size={16} className="md:w-[18px] md:h-[18px]" />
            학습 보고서
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2 md:py-3 px-2 md:px-4 rounded-lg font-medium text-xs md:text-base transition-all ${
              activeTab === 'monthly'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <BarChart3 size={16} className="md:w-[18px] md:h-[18px]" />
            월말평가
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2 md:py-3 px-2 md:px-4 rounded-lg font-medium text-xs md:text-base transition-all ${
              activeTab === 'weekly'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <TrendingUp size={16} className="md:w-[18px] md:h-[18px]" />
            주간평가
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8">
        
        {/* 학습 보고서 탭 */}
        {activeTab === 'report' && (
          <>
            {/* 학습 요약 */}
            <section 
              className={`transition-all duration-700 delay-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <h2 className="flex items-center gap-2 text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
                <BookOpen className="text-red-500" size={20} />
                학습 요약
              </h2>
              <div className="bg-white rounded-xl p-5 md:p-6 shadow-sm border border-gray-100">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                  {reportData.summary || '학습 요약이 아직 작성되지 않았습니다.'}
                </p>
              </div>
            </section>

            {/* 진도 현황 */}
            <section 
              className={`transition-all duration-700 delay-400 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <h2 className="flex items-center gap-2 text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
                <CheckCircle className="text-red-500" size={20} />
                진도 현황
              </h2>
              <div className="space-y-3">
                {reportData.progress && reportData.progress.length > 0 ? (
                  reportData.progress.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
                    >
                      <div>
                        <h3 className="font-bold text-gray-800 text-base">{item.subject}</h3>
                        {item.description && (
                          <p className="text-xs md:text-sm text-gray-500 mt-1">{item.description}</p>
                        )}
                      </div>
                      <div className="flex justify-end">
                        {getStatusBadge(item.status)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm">진도 현황이 아직 작성되지 않았습니다.</p>
                  </div>
                )}
              </div>
            </section>

            {/* 과제 수행 현황 */}
            <section 
              className={`transition-all duration-700 delay-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <h2 className="flex items-center gap-2 text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
                <Clock className="text-red-500" size={20} />
                과제 수행 현황
              </h2>
              <div className="bg-white rounded-xl p-5 md:p-6 shadow-sm border border-gray-100">
                <div className="flex justify-around items-center">
                  <div className="text-center">
                    <p className="text-3xl md:text-4xl font-bold text-green-600">{reportData.homework?.submit || 0}</p>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">제출 완료</p>
                  </div>
                  <div className="w-px h-12 bg-gray-100"></div>
                  <div className="text-center">
                    <p className="text-3xl md:text-4xl font-bold text-red-600">{reportData.homework?.notSubmit || 0}</p>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">미제출</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 선생님 코멘트 */}
            <section 
              className={`transition-all duration-700 delay-600 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <h2 className="flex items-center gap-2 text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
                <MessageSquare className="text-red-500" size={20} />
                선생님 코멘트
              </h2>
              <div className="bg-red-50 rounded-xl p-5 md:p-6 shadow-sm border border-red-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-red-600 transform translate-x-1/4 -translate-y-1/4">
                  <MessageSquare size={100} />
                </div>
                <p className="text-xs md:text-sm text-red-600 font-bold mb-2 uppercase tracking-wide">Teacher's Note</p>
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm md:text-base relative z-10 font-medium">
                  {reportData.teacherComment || '코멘트가 아직 작성되지 않았습니다.'}
                </p>
              </div>
            </section>

            {/* 출결 현황 (모바일 최적화: 2열 그리드) */}
            <section 
              className={`transition-all duration-700 delay-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <h2 className="flex items-center gap-2 text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
                <AlertCircle className="text-red-500" size={20} />
                출결 현황
              </h2>
              <div className="bg-white rounded-xl p-5 md:p-6 shadow-sm border border-gray-100">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-green-600">{reportData.attendance?.attend || 0}</p>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">출석</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-yellow-600">{reportData.attendance?.late || 0}</p>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">지각</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-orange-600">{reportData.attendance?.earlyLeave || 0}</p>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">조퇴</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-red-600">{reportData.attendance?.absent || 0}</p>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">결석</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 col-span-2 md:col-span-1">
                    <p className="text-2xl font-bold text-blue-600">{reportData.attendance?.makeup || 0}</p>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">보강</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* 월말평가 탭 */}
        {activeTab === 'monthly' && (
          <section className="space-y-6">
            <h2 className="flex items-center gap-2 text-lg md:text-xl font-bold text-gray-800">
              <BarChart3 className="text-red-500" size={20} />
              월말평가 성적
            </h2>
            {renderBarChart(reportData.scores?.monthly, '월말평가 점수')}
          </section>
        )}

        {/* 주간평가 탭 */}
        {activeTab === 'weekly' && (
          <section className="space-y-6">
            <h2 className="flex items-center gap-2 text-lg md:text-xl font-bold text-gray-800">
              <TrendingUp className="text-red-500" size={20} />
              주간평가 성적
            </h2>
            {renderBarChart(reportData.scores?.weekly, '주간평가 점수')}
          </section>
        )}

      </main>

      {/* 푸터 */}
      <footer className="bg-gray-800 text-gray-400 py-8 px-4 mt-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-bold text-white mb-2">오르라수학전문학원</p>
          <p className="text-xs md:text-sm opacity-60">© 2026 All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}