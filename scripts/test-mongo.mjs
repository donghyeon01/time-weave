import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

try {
  // 서버 선택 제한 시간을 10초로 설정
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log('MongoDB 연결 성공:', mongoose.connection.name);
  await mongoose.disconnect();
  console.log('연결 종료');
} catch (error) {
  console.error('MongoDB 연결 실패:', error.message);
  process.exit(1);
}
