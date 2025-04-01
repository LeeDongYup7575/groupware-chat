// 라우터 관련 훅 (Link는 사용 안 하고 있음)
import { Link, useLocation, useSearchParams } from "react-router-dom";

// CSS 모듈 import
import style from './Main.module.css';

// 하위 컴포넌트 import
import ChatRoom from "../ChatRoom/ChatRoom";
import Chat from "../Chat/Chat";
import ChatMember from "../ChatMember/ChatMember";

// React 기본 훅 import
import { useEffect, useRef, useState } from "react";

// WebSocket 클라이언트용 stomp.js
import { Client } from '@stomp/stompjs';

// WebSocket 핸드셰이크용 SockJS 클라이언트
import SockJS from "sockjs-client";

// axios 기반 커스텀 API 클라이언트
import ApiClient from "../../Api/ApiClient";

const MainPage = () => {
    // 💬 선택된 채팅방 정보 (ChatRoom → Chat 컴포넌트에 전달)
    const [selectedChat, setSelectedChat] = useState();

    // 💌 채팅방별 메시지를 저장하는 객체 형태의 상태
    // ex) { 1: [...msg1, msg2], 2: [...msg1, msg2] }
    const [messages, setMessages] = useState({});

    // 🧠 stomp 클라이언트를 저장할 Ref (재렌더링 안 됨)
    const clientRef = useRef(null);


    // ✅ 채팅방 클릭 시 ChatRoom → MainPage로 전달되는 콜백
    const handleChatRoom = (chatData) => {
        // 선택된 채팅방 정보를 상태에 저장
        setSelectedChat(chatData);
    };

    // 🧠 STOMP WebSocket 연결 + 전체 채팅방 구독
    useEffect(() => {
        // SockJS로 WebSocket 핸드셰이크 (http → ws 전환)
        const socket = new SockJS("http://localhost:80/ws");

        // stomp 클라이언트 생성
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000, // 연결 끊어지면 5초마다 재시도

            // 🔌 WebSocket 연결 완료 시 실행
            onConnect: () => {
                console.log("Stomp연결 완료");

                // 🔁 모든 채팅방을 서버에서 가져와서 각 방에 대해 구독 설정
                ApiClient("/chatroom").then(resp => {
                    resp.data.forEach(room => {
                        // ex) /topic/chat/1, /topic/chat/2 ...
                        client.subscribe(`/topic/chat/${room.id}`, (message) => {
                            const msg = JSON.parse(message.body); // 수신 메시지 JSON 파싱

                            // 채팅방 별 메시지 배열에 새 메시지 추가
                            setMessages(prev => ({
                                ...prev,
                                [msg.chatroomId]: [...(prev[msg.chatroomId] || []), msg]
                            }));
                        });
                    });
                });
            }
        });

        // WebSocket 연결 시작
        client.activate();

        // stomp 클라이언트를 ref에 저장 (Chat에서 사용)
        clientRef.current = client;

        // 컴포넌트 언마운트 시 WebSocket 연결 해제
        return () => {
            if (client.connected) client.deactivate();
        };
    }, []);
    return (
        <div className={style.container}>
            {/* 💬 좌측: 채팅방 리스트 (채팅방 클릭 시 selectedChat 변경) */}
            <ChatRoom selectedRoom={handleChatRoom} />

            {/* 💬 중앙: 선택된 채팅방의 채팅창 */}
            <Chat
                selectedChat={selectedChat}                         // 선택된 채팅방 정보
                messages={messages[selectedChat?.id] || []}         // 해당 채팅방의 메시지 배열
                client={clientRef.current}                          // WebSocket client
            />

            {/* 💬 우측: 채팅방 참여 멤버 정보 */}
            <ChatMember selectedChat={selectedChat} />
        </div>
    );
};

export default MainPage;
