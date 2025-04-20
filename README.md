# 💬 ChatPractice - 그룹웨어 실시간 채팅 프론트엔드

Spring Boot + Thymeleaf 기반 그룹웨어의 실시간 채팅 기능만 React로 분리하여 구현한 프로젝트입니다.  
STOMP 기반 WebSocket 통신으로 실시간 메시지 송수신이 가능하며, 추후 Firebase를 통해 배포 예정입니다.

## 🚀 기술 스택

### Frontend
- **React 19**
- **Zustand (리팩토링 예정)** - 상태 관리
- **React Router DOM 7** - 라우팅
- **Axios** - API 통신
- **SockJS + STOMP.js + React-STOMP** - 실시간 WebSocket 채팅
- **Firebase Hosting** - (🛠 배포 예정)

### Backend
- **Spring Boot + Thymeleaf**
- **JWT** 인증 기반 REST API
- **MongoDB (Atlas)** - 채팅 메시지 저장
- **MySQL** - 유저 및 조직 데이터 저장

## 🧩 주요 기능

- ✅ 채팅방 목록 조회 및 선택
- ✅ 채팅방별 실시간 메시지 송수신
- ✅ 채팅 참여자 리스트 토글
- ✅ JWT 기반 사용자 인증 연동
- ✅ 채팅방 생성 및 채팅방 전환 기능
- ✅ 반응형 UI 구현 (모바일 최적화)

## 📁 프로젝트 구조

```bash
chatpractice/
├── public/                  # 정적 파일
├── src/
│   ├── Api/                 # Axios 인스턴스
│   ├── Chat/                # 채팅창 컴포넌트
│   ├── ChatMember/          # 참여자 목록
│   ├── ChatRoom/            # 채팅방 리스트
│   ├── NewChatRoom/         # 채팅방 생성
│   ├── Store/               # Zustand 상태관리
│   ├── App.js
│   └── MainPage.js
├── package.json
└── firebase.json            # Firebase 배포 설정 (예정)
```

## 📦 설치 및 실행

```bash
# 1. 의존성 설치
npm install

# 2. 백엔드 주소 설정
#    아래 파일에서 baseURL을 실제 Spring Boot 서버 주소로 수정하세요.
#    📍 src/Api/ApiClient.js

# 예시:
# const ApiClient = axios.create({
#   baseURL: "http://localhost:8080"  // 또는 EC2 서버 주소
# });

# 3. 개발 서버 실행
npm run dev
```

> ⚠️ 주의: WebSocket(STOMP) 서버 주소도 반드시 백엔드 주소에 맞춰 설정해야 합니다.  
> 예: `"ws://localhost:8080/ws"` 또는 `"wss://your-domain/ws"`

> 💡 백엔드(Spring Boot)는 별도로 실행되어 있어야 하며,  
> CORS 오류 방지를 위해 `proxy` 설정 또는 Spring CORS 설정이 필요할 수 있습니다.

## 🌐 배포
- Firebase Hosting을 통한 배포 예정

## 📸 시연 예시
> (스크린샷 또는 시연 영상 추가 시 여기에 삽입)

## ✍️ 개발자
- 이동엽 (이메일: booo7575@naver.com)
