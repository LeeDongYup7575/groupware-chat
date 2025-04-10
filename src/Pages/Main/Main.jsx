// ✅ 필요한 라이브러리 및 컴포넌트 import
import {use, useEffect, useRef, useState} from "react";
import style from './Main.module.css';
import ChatRoom from "../ChatRoom/ChatRoom";        // 좌측: 채팅방 리스트
import Chat from "../Chat/Chat";                    // 중앙: 채팅창
import ChatMember from "../ChatMember/ChatMember";  // 우측: 참여자 리스트
import {Client} from '@stomp/stompjs';             // STOMP WebSocket 클라이언트
import ApiClient from "../../Api/ApiClient";         // Axios 기반 API 클라이언트

function parseJwt(token) {
    try {
        const base64Payload = token.split('.')[1];  // JWT에서 payload 부분 뽑기
        const payload = atob(base64Payload);        // Base64 디코딩
        return JSON.parse(payload);                 // JSON으로 파싱
    } catch (e) {
        return null;  // 에러나면 null
    }
}

// ✨ MainPage 컴포넌트 시작
const MainPage = () => {
    // ✅ 선택된 채팅방 정보
    const [selectedChat, setSelectedChat] = useState();

    // ✅ 채팅방별 메시지 목록
    const [messages, setMessages] = useState({});

    // ✅ 로그인한 사용자가 참여 중인 채팅방 목록
    const [chatRoom, setChatRoom] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState();


    // ✅ STOMP 클라이언트와 참조들
    const clientRef = useRef(null);                  // WebSocket 연결 인스턴스
    const selectedChatRef = useRef(null);             // 선택된 채팅방 ref (구독 관리용)
    const subscribeRooms = useRef(new Set());         // 이미 구독한 채팅방 Set

    // ✅ 채팅방 클릭 핸들러
    const handleChatRoom = (chatData) => {
        setSelectedChat(chatData);                    // 선택한 채팅방 상태 저장
        selectedChatRef.current = chatData;           // ref에도 저장 (WebSocket 알림 처리를 위해)
        ApiClient.post("/unread/clear", {roomId: chatData.id})
        fetchChatRooms();
        fetchUnreadCounts();
    };

    const fetchUnreadCounts = async () => {
        try {
            const resp = await ApiClient.get("/unread/count");
            setUnreadCounts(resp.data);
        } catch (error) {
            console.error("안읽은 메시지 불러오기 실패", error);
            alert("안읽은 메시지를 불러오지 못했습니다. 다시시도해주세요!");
        }
    }
    // ✅ 채팅방 목록 가져오기 (API 호출)
    const fetchChatRooms = async () => {
        try {
            const resp = await ApiClient.get("/chatroom");
            setChatRoom(resp.data || []);             // 혹시 null이면 빈 배열로
            if (clientRef.current && clientRef.current.connected) {
                resp.data.forEach(room => {
                    subscribeToRoom(room.id);         // 각 방에 WebSocket 구독
                });
            }
            fetchUnreadCounts();
        } catch (error) {
            console.error("채팅방 목록 불러오기 실패", error);
            setChatRoom([]);                          // 실패 시 빈 배열로 초기화
        }
    };

    // ✅ 컴포넌트 마운트 시 WebSocket 연결
    useEffect(() => {
        const token = localStorage.getItem("accessToken");   // JWT 토큰 가져오기

        const client = new Client({
            brokerURL: "ws://10.10.55.57:80/ws",             // WebSocket 서버 주소
            connectHeaders: {Authorization: `Bearer ${token}`},  // JWT 토큰 추가
            reconnectDelay: 5000,                            // 연결 끊기면 5초마다 재시도
            onConnect: () => {
                console.log("✅ STOMP 연결 성공");

                // 🔹 채팅방 목록 가져와서 모두 구독
                ApiClient("/chatroom").then((resp) => {
                    resp.data.forEach(room => {
                        subscribeToRoom(room.id);
                    });
                });

                // 🔹 채팅방 삭제 알림 수신
                client.subscribe("/topic/roomDeleted", (message) => {
                    const payload = JSON.parse(message.body);
                    if (selectedChatRef.current?.id === payload.roomid) {
                        alert('이 채팅방은 삭제되었습니다.');
                        setSelectedChat(null);
                        selectedChatRef.current = null;
                    }
                    fetchChatRooms();  // 채팅방 리스트 새로고침
                });

                // 🔹 새 채팅방 생성 알림 수신
                client.subscribe("/topic/chatroom/created", (message) => {
                    fetchChatRooms();  // 채팅방 리스트 새로고침
                });

                const token = localStorage.getItem("accessToken");
                const userInfo = token ? parseJwt(token) : null;
                const userId = userInfo.id;
                client.subscribe(`/topic/chat/${userId}`, () => {
                    fetchUnreadCounts();
                })


            },
            onStompError: (frame) => {
                alert("서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
                console.error("❌ STOMP 에러:", frame.headers['message']);
            }
        });

        client.activate();             // WebSocket 연결 시작
        clientRef.current = client;    // ref에 저장

        return () => {
            if (client.connected) client.deactivate();   // 컴포넌트 언마운트 시 연결 종료
        };
    }, []);

    // ✅ 채팅방 WebSocket 구독 함수
    const subscribeToRoom = (roomId) => {
        if (clientRef.current && clientRef.current.connected) {
            const topic = `/topic/chat/${roomId}`;
            if (subscribeRooms.current.has(roomId)) return; // 이미 구독했으면 패스

            clientRef.current.subscribe(topic, (message) => {
                const msg = JSON.parse(message.body);

                // 🔹 새로운 메시지를 messages 상태에 추가
                setMessages((prev) => ({
                    ...prev,
                    [msg.chatroomId]: [...(prev[msg.chatroomId] || []), msg],
                }));

                // 🔹 해당 채팅방의 최근 메시지, 시간 갱신
                setChatRoom((prevRooms) =>
                    prevRooms.map((room) =>
                        room.id === msg.chatroomId
                            ? {...room, lastMessage: msg.content, lastMessageTime: msg.sentAt}
                            : room
                    )
                );
            });

            subscribeRooms.current.add(roomId);   // 구독 완료 표시
        }
    };

    // ✅ 채팅방 WebSocket 구독 해제 함수
    const unSubscribeToRoom = (roomId) => {
        if (clientRef.current && clientRef.current.connected) {
            clientRef.current.unsubscribe(`/topic/chat/${roomId}`);
        }
    };

    // ✅ 화면 렌더링
    return (
        <div className={style.container}>
            {/* 좌측: 채팅방 목록 */}
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

            {/* 중앙: 채팅창 */}
            <Chat
                selectedChat={selectedChat}
                messages={messages[selectedChat?.id] || []}
                client={clientRef.current}
                fetchChatRooms={fetchChatRooms}
                unSubscribeToRoom={unSubscribeToRoom}
                setSelectedChat={setSelectedChat}

            />

            {/* 우측: 채팅방 참여자 목록 */}
            <ChatMember selectedChat={selectedChat}/>
        </div>
    );
};

// ✨ 외부에서 사용할 수 있도록 export
export default MainPage;
