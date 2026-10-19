import React from 'react';
import ReactDOM from 'react-dom/client';
// 글꼴은 직접 호스팅(빌드에 포함). 구글 폰트 서버로 방문자 IP가 넘어가지 않게. 한글은 유니코드 구간별 파일로 쪼개져 쓰는 글자만 받음
import '@fontsource/ibm-plex-sans-kr/400.css';
import '@fontsource/ibm-plex-sans-kr/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/hahmlet/700.css';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
