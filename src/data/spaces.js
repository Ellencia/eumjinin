const spaces = [
  {
    id: 1,
    type: 'stage',
    name: '준비중',
    capacity: 1,
    desc: '',
    tags: [],
  },
  {
    id: 6,
    type: 'stage',
    name: 'Art Hall K',
    capacity: 150,
    desc: '다목적 아트 홀로, 공연·전시 등 다양한 문화 행사를 수용할 수 있는 무대입니다.',
    tags: ['아트홀', '다목적', '공연', '조명', '영상'],
    // 이하 상세 페이지용
    lead: '매달 음진인 정기 공연이 열리는 홀입니다. 객석을 원형 테이블로 깔면 공연과 뒤풀이를 한 공간에서 치를 수 있습니다.',
    location: '경기 고양시 덕양구 행주산성로 38, 해찬송학김 B1',
    mapUrl: 'https://map.naver.com/p/search/' + encodeURIComponent('해찬송학김'),
    spec: [['객석', '150석'], ['음향', 'PA 시스템'], ['영상', 'LED 백 패널'], ['조명', '이동식 조명 리그']],
    // 포스터로 확인한 날짜만. 공연명은 확인되면 추가
    shows: ['2026.10.04', '2026.06.07', '2026.05.03', '2026.04.05', '2026.03.08'],
  },
  {
    id: 2,
    type: 'stage',
    name: '준비중',
    capacity: 1,
    desc: '',
    tags: [],
  },
  {
    id: 3,
    type: 'rehearsal',
    name: '준비중',
    capacity: 1,
    desc: '',
    tags: [],
  },
  {
    id: 4,
    type: 'rehearsal',
    name: '준비중',
    capacity: 1,
    desc: '',
    tags: [],
  },
  {
    id: 5,
    type: 'rehearsal',
    name: '준비중',
    capacity: 1,
    desc: '',
    tags: [],
  },
];

export default spaces;
