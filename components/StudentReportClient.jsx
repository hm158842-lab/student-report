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
          <span className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
            완료
          </span>
        );
      case 'in-progress':
        return (
          <span className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
            진행중
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full">
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
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-center">{title} 데이터가 없습니다.</p>
        </div>
      );
    }

    const maxScore = 100;

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-6">{title}</h3>
        <div className="space-y-4">
          {scores.map((item, index) => (
            <div key={item.id || index} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">{item.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-xs">평균 {item.avgScore}점</span>
                  <span className="font-bold text-gray-800">{item.score}점</span>
                  {item.rank && (
                    <span className="text-xs text-blue-600 font-medium">({item.rank}등)</span>
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
                <div
                  className={`h-6 rounded-full ${getScoreColor(item.score)} transition-all duration-1000 ease-out`}
                  style={{ width: `${(item.score / maxScore) * 100}%` }}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                    {item.score}점
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-red-600 to-red-500 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 
            className={`text-2xl md:text-3xl font-bold text-center mb-4 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            {reportData.reportMonth?.split('-')[0]}년 {reportData.reportMonth?.split('-')[1]}월 학습 보고서 - 만티반
          </h1>
          <div 
            className={`flex flex-wrap justify-center gap-4 md:gap-8 text-sm md:text-base transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="flex items-center gap-2">
              <User size={18} />
              <span>{reportData.studentName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>{reportData.period}</span>
            </div>
            <div className="flex items-center gap-2">
  <BookOpen size={18} />
  {/* 출석 + 지각 + 조퇴 + 보강 횟수를 모두 더해서 보여줌 */}
  <span>총 {
    (reportData.attendance?.attend || 0) +
    (reportData.attendance?.late || 0) +
    (reportData.attendance?.earlyLeave || 0) +
    (reportData.attendance?.makeup || 0)
  }회 수업</span>
</div>
          </div>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="flex gap-2 bg-white rounded-xl p-2 shadow-sm border border-gray-100">
          <button
            onClick={() => setActiveTab('report')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'report'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BookOpen size={18} />
            학습 보고서
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'monthly'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BarChart3 size={18} />
            월말평가
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'weekly'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <TrendingUp size={18} />
            주간평가
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* 학습 보고서 탭 */}
        {activeTab === 'report' && (
          <>
            {/* 학습 요약 */}
            <section 
              className={`transition-all duration-700 delay-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <h2 className="flex items-center gap-2 text-xl font-bold text-red-600 mb-4">
                <span className="w-1 h-6 bg-red-600 rounded-full"></span>
                <BookOpen size={20} />
                학습 요약
              </h2>
              <div className="bg-red-50 rounded-xl p-6 shadow-sm border border-red-100">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
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
              <h2 className="flex items-center gap-2 text-xl font-bold text-red-600 mb-4">
                <span className="w-1 h-6 bg-red-600 rounded-full"></span>
                <CheckCircle size={20} />
                진도 현황
              </h2>
              <div className="space-y-3">
                {reportData.progress && reportData.progress.length > 0 ? (
                  reportData.progress.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex justify-between items-center"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-800">{item.subject}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        )}
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-gray-500">진도 현황이 아직 작성되지 않았습니다.</p>
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
              <h2 className="flex items-center gap-2 text-xl font-bold text-red-600 mb-4">
                <span className="w-1 h-6 bg-red-600 rounded-full"></span>
                <Clock size={20} />
                과제 수행 현황
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-around items-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{reportData.homework?.submit || 0}회</p>
                    <p className="text-sm text-gray-500 mt-1">제출</p>
                  </div>
                  <div className="w-px h-12 bg-gray-200"></div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-600">{reportData.homework?.notSubmit || 0}회</p>
                    <p className="text-sm text-gray-500 mt-1">미제출</p>
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
              <h2 className="flex items-center gap-2 text-xl font-bold text-red-600 mb-4">
                <span className="w-1 h-6 bg-red-600 rounded-full"></span>
                <MessageSquare size={20} />
                선생님 코멘트
              </h2>
              <div className="bg-red-50 rounded-xl p-6 shadow-sm border border-red-100">
                <p className="text-sm text-red-600 font-medium mb-2">담당 선생님</p>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {reportData.teacherComment || '코멘트가 아직 작성되지 않았습니다.'}
                </p>
              </div>
            </section>

            {/* 출결 현황 */}
            <section 
              className={`transition-all duration-700 delay-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <h2 className="flex items-center gap-2 text-xl font-bold text-red-600 mb-4">
                <span className="w-1 h-6 bg-red-600 rounded-full"></span>
                <AlertCircle size={20} />
                출결 현황
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="grid grid-cols-5 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{reportData.attendance?.attend || 0}회</p>
                    <p className="text-sm text-gray-500 mt-1">출석</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{reportData.attendance?.late || 0}회</p>
                    <p className="text-sm text-gray-500 mt-1">지각</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{reportData.attendance?.earlyLeave || 0}회</p>
                    <p className="text-sm text-gray-500 mt-1">조퇴</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{reportData.attendance?.absent || 0}회</p>
                    <p className="text-sm text-gray-500 mt-1">결석</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{reportData.attendance?.makeup || 0}회</p>
                    <p className="text-sm text-gray-500 mt-1">보강</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* 월말평가 탭 */}
        {activeTab === 'monthly' && (
          <section className="space-y-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-red-600">
              <span className="w-1 h-6 bg-red-600 rounded-full"></span>
              <BarChart3 size={20} />
              월말평가 성적
            </h2>
            {renderBarChart(reportData.scores?.monthly, '월말평가 점수')}
          </section>
        )}

        {/* 주간평가 탭 */}
        {activeTab === 'weekly' && (
          <section className="space-y-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-red-600">
              <span className="w-1 h-6 bg-red-600 rounded-full"></span>
              <TrendingUp size={20} />
              주간평가 성적
            </h2>
            {renderBarChart(reportData.scores?.weekly, '주간평가 점수')}
          </section>
        )}

      </main>

      {/* 푸터 */}
      <footer className="bg-gray-800 text-gray-400 py-6 px-4 mt-12">
        <div className="max-w-4xl mx-auto text-center text-sm">
          <p>© 2026 오르라수학전문학원. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}