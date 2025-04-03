// CSS 모듈 불러오기 (Chat.module.css 파일 안의 클래스들을 JS 객체처럼 사용 가능)
import style from "./Chat.module.css";

// React 훅 사용
import {useEffect, useRef, useState} from "react";

// axios 기반 API 클라이언트 (백엔드와 통신에 사용)
import ApiClient from "../../Api/ApiClient";

// Chat 컴포넌트 시작 - props로 선택된 채팅방, 실시간 메시지들, 소켓 클라이언트를 받음
const Chat = ({selectedChat, messages = [], client}) => {
    // ✅ JWT 토큰 해석 유틸 함수
    function parseJwt(token) {
        try {
            const base64Payload = token.split('.')[1];
            const payload = atob(base64Payload);
            return JSON.parse(payload);
        } catch (e) {
            return null;
        }
    }

    // ✅ 사용자 정보 파싱
    const token = localStorage.getItem("accessToken");
    const userInfo = token ? parseJwt(token) : null;
    const userId = userInfo?.id;

    // ✅ 이전 메시지 목록
    const [prevMessages, setPrevMessages] = useState([]);

    // ✅ 채팅방 선택 시 과거 메시지 불러오기
    useEffect(() => {
        if (selectedChat) {
            ApiClient.get(`/chat/message/${selectedChat.id}`).then(resp => {
                const messages = Array.isArray(resp.data) ? resp.data : [{
                    content: "아직 채팅내용이 없습니다",
                    senderId: "system",
                    senderName: "시스템"
                }];
                setPrevMessages(messages);
            });
        }
    }, [selectedChat]);

    // ✅ 현재 입력 중인 채팅 텍스트
    const [input, setInput] = useState("");

    // ✅ 메시지 전송
    const sendMessage = () => {
        if (!input.trim() || !selectedChat || !client?.connected) return;

        const message = {
            type: "text",
            content: input,
            senderId: userId,
            chatroomId: selectedChat.id
        };

        client.publish({
            destination: `/app/chat/${selectedChat.id}`,
            body: JSON.stringify(message)
        });

        setInput("");
    };

    // ✅ 스크롤 하단 고정용 ref
    const messagesEndRef = useRef(null);

    // ✅ 메시지 추가 시 자동 스크롤
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({behavior: "smooth"});
        }
    }, [prevMessages, messages]);

    // ✅ 전체 메시지 = 이전 메시지 + 실시간 메시지
    const allMessages = [...prevMessages, ...(messages || [])];

    // ✅ 채팅방 나가기 핸들러
    const handleExit = () => {
        const confirmExit = window.confirm("정말 이 채팅방에서 나가시겠습니까?");
        if (!confirmExit) return;
        const id = selectedChat.id;
        ApiClient.post(`/membership/delete?roomid=${id}`).then(resp => {
            console.log(resp.data);
        });
    };

    // ✅ 렌더링
    return (
        <div className={style.chatsection}>
            {/* 💬 채팅방 상단 정보 */}
            <div className={style.chatheader}>
                <div className={style.chatheadercontentname}>
                    {selectedChat ? selectedChat.name : "채팅방 선택"}
                </div>
                <button onClick={handleExit}>나가기</button>
            </div>

            {/* 💬 메시지 목록 출력 */}
            <div className={style.chat}>
                {selectedChat ? (
                    allMessages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={msg.senderId === userId ? style.chatwriter : style.chatsender}
                        >
                            <strong>{msg.senderName || "사용자"} : </strong> {msg.content}
                        </div>
                    ))
                ) : (
                    <p>채팅방을 선택하면 메시지가 표시됩니다.</p>
                )}
                <div ref={messagesEndRef}/>
                {/* 스크롤 하단 기준 */}
            </div>

            {/* 💬 채팅 입력창 */}
            <div className={style.chatinput}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyUp={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="메시지를 입력하세요"
                />
                <button onClick={sendMessage}>보내기</button>
            </div>
        </div>
    );
};

export default Chat;
