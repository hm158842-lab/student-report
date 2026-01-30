// lib/gemini.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateReportContent(studentData) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
당신은 학원 선생님입니다. 아래 학생 데이터를 보고 학습 보고서를 작성해주세요.

학생 이름: ${studentData.studentName}
보고서 기간: ${studentData.period}

[진도 현황]
${studentData.progressText || '데이터 없음'}

[출결 현황]
- 출석: ${studentData.attendance?.attend || 0}회
- 지각: ${studentData.attendance?.late || 0}회
- 조퇴: ${studentData.attendance?.earlyLeave || 0}회
- 결석: ${studentData.attendance?.absent || 0}회
- 보강: ${studentData.attendance?.makeup || 0}회

[과제 수행]
- 제출: ${studentData.homework?.submit || 0}회
- 미제출: ${studentData.homework?.notSubmit || 0}회

위 데이터를 바탕으로 아래 두 가지를 작성해주세요:

1. [학습요약] (3~4문장)
- 이번 달 학습 내용 요약
- 학생의 학습 성취도 평가
- 잘한 점 언급

2. [선생님코멘트] (4~5문장)
- 학생에게 전하는 격려의 말
- 개선이 필요한 부분 (부드럽게)
- 다음 달 학습 방향 제안
- 응원 메시지

반드시 아래 JSON 형식으로만 응답하세요:
{
  "summary": "학습요약 내용",
  "comment": "선생님 코멘트 내용"
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // JSON 파싱
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || '',
        comment: parsed.comment || '',
      };
    }
    
    return { summary: '', comment: '' };
  } catch (error) {
    console.error('Gemini API Error:', error);
    return { summary: '', comment: '' };
  }
}