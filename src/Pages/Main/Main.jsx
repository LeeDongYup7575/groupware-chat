import { useEffect, useRef, useState } from "react";
import style from './Main.module.css';
import ChatRoom from "../ChatRoom/ChatRoom";
import Chat from "../Chat/Chat";
import ChatMember from "../ChatMember/ChatMember";
import { Client } from '@stomp/stompjs';
import ApiClient from "../../Api/ApiClient";

function parseJwt(token) {
    try {
        const base64Payload = token.split('.')[1];
        const payload = atob(base64Payload);
        return JSON.parse(payload);
    } catch {
        return null;
    }
}

const MainPage = () => {
    const [selectedChat, setSelectedChat] = useState();
    const [messages, setMessages] = useState({});
    const [chatRoom, setChatRoom] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState({});
    const clientRef = useRef(null);
    const selectedChatRef = useRef(null);
    const subscribedRooms = useRef(new Set());

    const handleChatRoom = (chatData) => {
        setSelectedChat(chatData);
        selectedChatRef.current = chatData;
        ApiClient.post("/unread/clear", { roomId: chatData.id });
        fetchUnreadCounts();
    };

    const fetchUnreadCounts = async () => {
        try {
            const resp = await ApiClient.get("/unread/count");
            const counts = resp.data;

            if (selectedChatRef.current) {
                const currentRoomId = selectedChatRef.current.id;

                if (counts[currentRoomId] && counts[currentRoomId] > 0) {
                    counts[currentRoomId] = 0;  // 프론트에선 바로 0 세팅
                    ApiClient.post("/unread/clear", { roomId: currentRoomId }); // 서버에도 clear 요청
                }
            }

            setUnreadCounts(counts);
        } catch (error) {
            console.error("❗ 안읽은 메시지 불러오기 실패", error);
            alert("안읽은 메시지를 불러오지 못했습니다. 다시 시도해주세요.");
        }
    };

    const fetchChatRooms = async () => {
        try {
            const resp = await ApiClient.get("/chatroom");
            setChatRoom(resp.data || []);

            if (clientRef.current?.connected) {
                resp.data.forEach(room => subscribeToRoom(room.id));
            }
        } catch (error) {
            console.error("❗ 채팅방 목록 불러오기 실패", error);
            setChatRoom([]);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const client = new Client({
            brokerURL: "ws://10.10.55.57:80/ws",
            connectHeaders: { Authorization: `Bearer ${token}` },
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("✅ STOMP 연결 성공");

                fetchChatRooms();
                fetchUnreadCounts();
                const userInfo = parseJwt(token);
                const userId = userInfo?.id;

                if (userId) {
                    client.subscribe(`/topic/chat/${userId}`, () => {
                        fetchUnreadCounts();
                    });
                }

                client.subscribe("/topic/roomDeleted", (message) => {
                    const payload = JSON.parse(message.body);
                    if (selectedChatRef.current?.id === payload.roomid) {
                        alert('채팅방이 삭제되었습니다.');
                        setSelectedChat(null);
                        selectedChatRef.current = null;
                    }
                    fetchChatRooms();
                });

                client.subscribe("/topic/chatroom/created", () => {
                    fetchChatRooms();
                });
            },
            onStompError: (frame) => {
                alert("서버 연결에 실패했습니다. 다시 시도해주세요.");
                console.error("❌ STOMP 에러:", frame.headers['message']);
            }
        });

        client.activate();
        clientRef.current = client;

        return () => {
            if (client.connected) client.deactivate();
        };
    }, []);

    const subscribeToRoom = (roomId) => {
        if (!clientRef.current?.connected || subscribedRooms.current.has(roomId)) return;

        clientRef.current.subscribe(`/topic/chat/${roomId}`, (message) => {
            const msg = JSON.parse(message.body);

            // 현재 보고 있는 채팅방이면 즉시 unread 초기화
            if (selectedChatRef.current?.id === msg.chatroomId) {
                setUnreadCounts(prev => ({ ...prev, [msg.chatroomId]: 0 }));
                ApiClient.post("/unread/clear", { roomId: msg.chatroomId });
            }

            // 새 메시지 추가
            setMessages(prev => ({
                ...prev,
                [msg.chatroomId]: [...(prev[msg.chatroomId] || []), msg],
            }));

            // 채팅방 최근 메시지 갱신
            setChatRoom(prevRooms =>
                prevRooms.map(room =>
                    room.id === msg.chatroomId
                        ? { ...room, lastMessage: msg.content, lastMessageTime: msg.sentAt }
                        : room
                )
            );
        });

        subscribedRooms.current.add(roomId);
    };

    const unSubscribeToRoom = (roomId) => {
        if (clientRef.current?.connected) {
            clientRef.current.unsubscribe(`/topic/chat/${roomId}`);
            subscribedRooms.current.delete(roomId);
        }
    };

    return (
        <div className={style.container}>
            <ChatRoom
                selectedRoom={handleChatRoom}
                subscribeToRoom={subscribeToRoom}
                unSubScribeToRoom={unSubscribeToRoom}
                fetchChatRooms={fetchChatRooms}
                setChatRoom={setChatRoom}
                chatRoom={chatRoom}
                messages={messages}
                unreadCounts={unreadCounts}
            />
            <Chat
                selectedChat={selectedChat}
                messages={messages[selectedChat?.id] || []}
                client={clientRef.current}
                fetchChatRooms={fetchChatRooms}
                unSubscribeToRoom={unSubscribeToRoom}
                setSelectedChat={setSelectedChat}
                fetchUnreadCount={fetchUnreadCounts}
            />
            <ChatMember selectedChat={selectedChat} />
        </div>
    );
};

export default MainPage;
