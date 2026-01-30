// app/api/generate/route.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const data = await request.json();
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
당신은 20년차 수학 학원 원장입니다. 아래 학생 데이터를 보고 학습 보고서를 작성해주세요.
따뜻하고 격려하는 톤으로 작성해주세요.
시작은 안녕하세요 오르라수학전문학원 만티입니다로 해주세요.

학생 이름: ${data.studentName}
보고서 기간: ${data.period}

[진도 현황]
${data.progressText || '데이터 없음'}

[출결 현황]
- 출석: ${data.attendance?.attend || 0}회
- 지각: ${data.attendance?.late || 0}회
- 조퇴: ${data.attendance?.earlyLeave || 0}회
- 결석: ${data.attendance?.absent || 0}회
- 보강: ${data.attendance?.makeup || 0}회

[과제 수행]
- 제출: ${data.homework?.submit || 0}회
- 미제출: ${data.homework?.notSubmit || 0}회

위 데이터를 바탕으로 아래 두 가지를 작성해주세요:

1. [학습요약] (3~4문장)
- 이번 달 학습 내용 요약
- 학생의 학습 성취도 평가
- 잘한 점 언급

2. [선생님코멘트] (4~5문장)
- 학부모에게 전하는 격려의 말
- 개선이 필요한 부분 (부드럽게)
- 다음 달 학습 방향 제안

반드시 아래 JSON 형식으로만 응답하세요:
{
  "summary": "학습요약 내용",
  "comment": "만T 코멘트 내용"
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json({
        success: true,
        summary: parsed.summary || '',
        comment: parsed.comment || '',
      });
    }
    
    return NextResponse.json({ success: false, error: 'Failed to parse response' });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ success: false, error: error.message });
  }
}