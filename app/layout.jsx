// app/layout.jsx
import './globals.css';

export const metadata = {
  title: '학생 학습 보고서',
  description: '학생별 맞춤 학습 현황 리포트',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
