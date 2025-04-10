// 📦 스타일(CSS 모듈) 불러오기
import style from "./Chat.module.css";

// 📦 React 훅과 axios 기반 API 클라이언트 불러오기
import {useEffect, useRef, useState} from "react";
import ApiClient from "../../Api/ApiClient";

// ✨ Chat 컴포넌트 (채팅 화면 구성)
const Chat = ({selectedChat, messages = [], client, fetchChatRooms, setSelectedChat, unSubscribeToRoom}) => {

    // ✅ JWT 토큰 파싱 유틸 함수
    function parseJwt(token) {
        try {
            const base64Payload = token.split('.')[1];
            const payload = atob(base64Payload);
            return JSON.parse(payload);
        } catch (e) {
            return null;   // 잘못된 토큰이면 null 리턴
        }
    }

    // ✅ 로그인된 사용자 정보 꺼내기
    const token = localStorage.getItem("accessToken");
    const userInfo = token ? parseJwt(token) : null;
    const userId = userInfo?.id;

    // ✅ 이전에 있던 메시지들 (과거 메시지 저장)
    const [prevMessages, setPrevMessages] = useState([]);

    // ✅ 현재 입력 중인 메시지 상태
    const [input, setInput] = useState("");

    // ✅ 채팅 스크롤 제어용 Ref
    const messagesEndRef = useRef(null);

    // ✅ 채팅방이 선택될 때 과거 메시지 불러오기
    useEffect(() => {
        if (selectedChat) {
            ApiClient.get(`/chat/message/${selectedChat.id}`).then(resp => {
                if (Array.isArray(resp.data) && resp.data.length > 0) {
                    setPrevMessages(resp.data); // 메시지가 있을 때만 저장
                } else {
                    setPrevMessages([]); // 아무 메시지도 없으면 비워버려
                }
            });
        }
    }, [selectedChat]);

    // ✅ 새로운 메시지가 오면 스크롤을 자동으로 아래로 이동
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({behavior: "smooth"});
        }
    }, [prevMessages, messages]);

    // ✅ 메시지 전송 함수
    const sendMessage = () => {
        if (!input.trim() || !selectedChat || !client?.connected) return;  // 공백이거나 연결 안되어있으면 무시

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

        setInput("");  // 입력창 비우기
    };

    // ✅ 채팅방 나가기 함수
    const handleExit = () => {
        if (selectedChat == null) {
            alert("선택된 채팅방이 없습니다.");
            return;
        }
        if (!window.confirm("정말 이 채팅방에서 나가시겠습니까?")) return;

        ApiClient.post(`/membership/delete?roomid=${selectedChat.id}`).then(resp => {
            fetchChatRooms();    // 채팅방 리스트 다시 불러오기
            setSelectedChat(null);   // 선택한 채팅방 비우기
            unSubscribeToRoom(selectedChat.id); // 구독 해제
        });
    };

    // ✅ 전체 메시지 (과거 메시지 + 실시간 메시지 합치기)
    const allMessages = [...prevMessages, ...(messages || [])];

    // ✅ 화면 렌더링
    return (
        <div className={style.chatsection}>
            {/* 채팅방 헤더 (방 이름 + 나가기 버튼) */}
            <div className={style.chatheader}>
                <div className={style.chatheadercontentname}>
                    {selectedChat ? selectedChat.name : "채팅방 선택"}
                </div>
                <button onClick={handleExit}>나가기</button>
            </div>

            {/* 채팅 메시지 목록 */}
            <div className={style.chat}>
                {selectedChat ? (
                    allMessages.length > 0 ? (
                        allMessages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={msg.senderId === userId ? style.chatwriter : style.chatsender}
                            >
                                <strong>{msg.senderName} : </strong> {msg.content}
                            </div>
                        ))
                    ) : (
                        <p>아직 채팅이 없습니다.</p>
                    )
                ) : (
                    <p>채팅방을 선택하면 메시지가 표시됩니다.</p>
                )}
                <div ref={messagesEndRef}/>
                {/* 스크롤 이동용 빈 div */}
            </div>

            {/* 채팅 입력창 */}
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
