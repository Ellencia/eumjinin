const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data', 'reservations.json');

function readData() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function hasConflict(existing, roomId, date, startTime, endTime) {
  return existing.some(r =>
    r.roomId === roomId &&
    r.date === date &&
    r.startTime < endTime &&
    r.endTime > startTime
  );
}

// 특정 방·날짜의 예약 목록 조회
app.get('/api/reservations', (req, res) => {
  const { roomId, date } = req.query;
  const all = readData();
  const result = all.filter(r =>
    r.roomId === parseInt(roomId) && r.date === date
  );
  res.json(result);
});

// 예약 신청 (충돌 검사 포함)
app.post('/api/reservations', (req, res) => {
  const { roomId, date, startTime, endTime, name } = req.body;
  const rawPhone = req.body.phone || '';

  // 숫자만 추출 후 010-XXXX-XXXX 형식으로 정규화
  const digits = rawPhone.replace(/\D/g, '');
  const phone = digits.length <= 7
    ? digits
    : `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;

  if (!roomId || !date || !startTime || !endTime || !name || !phone) {
    return res.status(400).json({ error: '모든 항목을 입력해주세요.' });
  }

  if (!/^\d{2,3}-\d{3,4}-\d{4}$/.test(phone)) {
    return res.status(400).json({ error: '올바른 전화번호 형식이 아닙니다.' });
  }

  const all = readData();

  if (hasConflict(all, parseInt(roomId), date, startTime, endTime)) {
    return res.status(409).json({ error: '해당 시간대에 이미 예약이 있습니다.' });
  }

  const newReservation = {
    id: Date.now(),
    roomId: parseInt(roomId),
    date,
    startTime,
    endTime,
    name,
    phone,
    createdAt: new Date().toISOString(),
  };

  all.push(newReservation);
  writeData(all);

  res.status(201).json({ success: true, reservation: newReservation });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`예약 서버 실행 중 → http://localhost:${PORT}`);
});
