import style from "./Chat.module.css";
import {useEffect, useRef, useState} from "react";
import ApiClient from "../../Api/ApiClient";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const Chat = ({ selectedChat }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const clientRef = useRef(null);

    // 메시지 가져오기 + STOMP 연결
    useEffect(() => {
        if (selectedChat) {
            // 1. 기존 메시지 가져오기
            ApiClient.get(`/chat/message/${selectedChat.id}`).then(resp => {
                setMessages(resp.data);
            });

            // 2. STOMP 연결 설정
            const socket = new SockJS("http://localhost:80/ws");
            const client = new Client({
                webSocketFactory: () => socket,
                reconnectDelay: 5000,
                onConnect: () => {
                    console.log("STOMP 연결됨");

                    // 현재 채팅방 구독
                    client.subscribe(`/topic/chat/${selectedChat.id}`, (message) => {
                        const receivedMsg = JSON.parse(message.body);
                        setMessages(prev => [...prev, receivedMsg]);
                    });
                }
            });

            client.activate();
            clientRef.current = client;

            // cleanup
            return () => {
                if (client && client.connected) {
                    client.deactivate();
                }
            };
        }
    }, [selectedChat]);

    // 메시지 전송
    const sendMessage = () => {
        if (!input.trim() || !selectedChat || !clientRef.current?.connected) return;

        const message = {
            type: "text",
            content: input,
            senderId: 3, // 로그인 유저 ID (임시 하드코딩)
            chatroomId: selectedChat.id
        };

        clientRef.current.publish({
            destination: `/app/chat/${selectedChat.id}`,
            body: JSON.stringify(message)
        });

        setInput("");
    };

    return (
        <div className={style.chatsection}>
            <div className={style.chatheader}>
                <div className={style.chatheadercontentname}>
                    {selectedChat ? selectedChat.name : "채팅방 선택"}
                </div>
            </div>
            <div className={style.chat}>
                {selectedChat ? (
                    messages.map((msg, idx) => (
                        <div key={idx} className={msg.senderId === 3 ? style.chatwriter : style.chatsender}>
                            <strong>{msg.senderName || "사용자"}:</strong> {msg.content}
                        </div>
                    ))
                ) : (
                    <p>채팅방을 선택하면 메시지가 표시됩니다.</p>
                )}
            </div>
            <div className={style.chatinput}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="메시지를 입력하세요"
                />
                <button onClick={sendMessage}>보내기</button>
            </div>
        </div>
    );
};

export default Chat;
