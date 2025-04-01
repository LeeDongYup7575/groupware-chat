// CSS 모듈 불러오기 (Chat.module.css 파일 안의 클래스들을 JS 객체처럼 사용 가능)
import style from "./Chat.module.css";

// React 훅 사용
import { useEffect, useState } from "react";

// axios 기반 API 클라이언트 (백엔드와 통신에 사용)
import ApiClient from "../../Api/ApiClient";

// Chat 컴포넌트 시작 - props로 선택된 채팅방, 실시간 메시지들, 소켓 클라이언트를 받음
const Chat = ({ selectedChat, messages = [], client }) => {

    // 📌 JWT 토큰을 해석해서 사용자 정보를 가져오는 함수
    function parseJwt(token) {
        try {
            // JWT는 3개의 .으로 나뉜 문자열, 중간(1번 index)이 payload
            const base64Payload = token.split('.')[1];

            // base64 디코딩 후 JSON 파싱
            const payload = atob(base64Payload);
            return JSON.parse(payload);
        } catch (e) {
            // 에러 발생 시 null 반환
            return null;
        }
    }

    // 📦 로컬스토리지에서 accessToken 가져오기
    const token = localStorage.getItem("accessToken");

    // 🔐 토큰이 존재하면 파싱해서 로그인 사용자 정보 추출
    const userInfo = token ? parseJwt(token) : null;

    // 👤 로그인한 사용자의 고유 ID (채팅 메시지 보낼 때 사용됨)
    const userId = userInfo?.id;

    // 💬 이전 메시지들 (과거 대화 기록)을 저장할 상태 변수
    const [prevMessages, setPrevMessages] = useState([]);

    // 📥 채팅방을 클릭할 때마다 과거 메시지를 서버에서 불러옴
    useEffect(() => {
        if (selectedChat) {
            // 채팅방 ID를 이용해 이전 메시지를 API로 GET 요청
            ApiClient.get(`/chat/message/${selectedChat.id}`).then(resp => {
                // 응답 데이터를 상태에 저장 (화면에 출력하기 위함)
                setPrevMessages(resp.data);
            });
        }
    }, [selectedChat]); // ← 채팅방이 바뀔 때마다 실행됨

    // ⌨️ 사용자가 채팅창에 입력 중인 텍스트를 저장할 상태 변수
    const [input, setInput] = useState("");

    // 🚀 채팅 메시지 전송 함수
    const sendMessage = () => {
        // 입력값이 없거나, 채팅방이 선택되지 않았거나, 소켓 연결이 안 되어 있다면 전송하지 않음
        if (!input.trim() || !selectedChat || !client?.connected) return;

        // 보낼 메시지 객체 구성
        const message = {
            type: "text",                 // 메시지 타입 (text, image 등 확장 가능)
            content: input,              // 입력한 메시지 내용
            senderId: userId,            // 보낸 사람 ID
            chatroomId: selectedChat.id  // 현재 채팅방 ID
        };

        // STOMP 클라이언트를 통해 메시지 전송
        client.publish({
            destination: `/app/chat/${selectedChat.id}`, // 서버의 메시지 핸들러 주소
            body: JSON.stringify(message)                // 메시지를 JSON 문자열로 전송
        });

        // 메시지 전송 후 입력창 비우기
        setInput("");
    };

    // 📦 화면에 출력할 전체 메시지 목록: 과거 메시지 + 실시간 수신 메시지
    const allMessages = [...prevMessages, ...(messages || [])];

    // 💡 화면 렌더링
    return (
        <div className={style.chatsection}>
            {/* 💬 채팅방 헤더: 채팅방 이름 표시 */}
            <div className={style.chatheader}>
                <div className={style.chatheadercontentname}>
                    {selectedChat ? selectedChat.name : "채팅방 선택"}
                </div>
            </div>

            {/* 💬 메시지 출력 영역 */}
            <div className={style.chat}>
                {selectedChat ? (
                    // 전체 메시지 목록을 순회하며 하나씩 출력
                    allMessages.map((msg, idx) => (
                        <div
                            key={idx} // 각 메시지에 고유 키 부여 (React 필수)
                            // 내가 보낸 메시지는 오른쪽 정렬, 남이 보낸 건 왼쪽 정렬
                            className={msg.senderId === userId ? style.chatwriter : style.chatsender}
                        >
                            {/* 보낸 사람 이름 + 메시지 내용 출력 */}
                            <strong>{msg.senderName || "사용자"}:</strong> {msg.content}
                        </div>
                    ))
                ) : (
                    // 채팅방이 선택되지 않은 경우 안내 메시지 출력
                    <p>채팅방을 선택하면 메시지가 표시됩니다.</p>
                )}
            </div>

            {/* ✍️ 채팅 입력창 + 보내기 버튼 */}
            <div className={style.chatinput}>
                <input
                    type="text"                       // 텍스트 입력
                    value={input}                     // 입력값 상태 연결
                    onChange={(e) => setInput(e.target.value)} // 입력될 때마다 상태 업데이트
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()} // Enter 키로 전송
                    placeholder="메시지를 입력하세요" // 안내 텍스트
                />
                <button onClick={sendMessage}>보내기</button>
            </div>
        </div>
    );
};

// 컴포넌트 외부에서 사용할 수 있도록 export
export default Chat;
