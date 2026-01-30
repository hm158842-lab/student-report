import { GoogleGenerativeAI } from '@google/generative-ai';
import { Client } from '@notionhq/client';
import { NextResponse } from 'next/server';

// 1. 노션과 AI 준비
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function GET() {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;

    // 2. '작성요청'은 체크되어 있는데, '생성완료'는 안 된 학생 찾기
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          { property: '작성요청', checkbox: { equals: true } },
          { property: '레포트 생성완료', checkbox: { equals: false } },
        ],
      },
    });

    if (response.results.length === 0) {
      return NextResponse.json({ message: '작성할 레포트가 없습니다! (작성요청 체크 확인필요)' });
    }

    const processedStudents = [];

    // 3. 찾은 학생 한 명씩 처리하기 (반복문)
    for (const page of response.results) {
      const props = page.properties;
      
      // 데이터 가져오기 (이름, 진도, 출결 등)
      const pageTitle = props['제목']?.title?.[0]?.plain_text || '학생'; // 제목: "2026년 1월 김나예" 등
      const progressText = props['진도현황']?.rich_text?.[0]?.plain_text || '데이터 없음';
      const attendString = props['출결과제_자동']?.formula?.string || '';
      const homeworkString = props['숙제_자동']?.formula?.string || '0,0';

      // AI에게 보낼 프롬프트 작성
      const prompt = `
당신은 20년차 수학 학원 원장입니다. 아래 학생 데이터를 보고 학습 보고서를 작성해주세요.
따뜻하고 격려하는 톤으로 작성해주세요.
시작은 "안녕하세요 오르라수학전문학원 만티입니다"로 시작해주세요.

[학생 정보]
- 문서제목: ${pageTitle}

[진도 현황]
${progressText}

[출결 및 과제 데이터]
${attendString}
(과제제출/미제출: ${homeworkString})

위 데이터를 바탕으로 아래 두 가지를 작성해주세요:

1. [학습요약] (3~4문장)
- 이번 달 학습 내용 요약
- 학생의 학습 성취도 평가
- 잘한 점 언급

2. [선생님코멘트] (4~5문장)
- 학부모에게 전하는 격려의 말
- 개선이 필요한 부분 (부드럽게)
- 다음 달 학습 방향 제안

반드시 아래 JSON 형식으로만 응답하세요 (다른 말 금지):
{
  "summary": "학습요약 내용...",
  "comment": "선생님 코멘트 내용..."
}
`;

      // AI에게 글쓰기 시키기
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // JSON 정리하기
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) continue; // 실패하면 넘어감
      const aiData = JSON.parse(jsonMatch[0]);

      // 4. 노션에 다시 채워넣기 (업데이트)
      await notion.pages.update({
        page_id: page.id,
        properties: {
          '학습요약': { rich_text: [{ text: { content: aiData.summary } }] },
          '만T코멘트': { rich_text: [{ text: { content: aiData.comment } }] },
          '레포트 생성완료': { checkbox: true }, // 완료 체크!
          '작성요청': { checkbox: false },      // 요청 체크 해제!
        },
      });

      processedStudents.push(pageTitle);
    }

    // 5. 끝! 결과 알려주기
    return NextResponse.json({ 
      success: true, 
      message: `${processedStudents.length}명의 레포트 생성 완료!`,
      students: processedStudents 
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}