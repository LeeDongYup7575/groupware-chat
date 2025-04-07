// ✅ 필요한 훅과 컴포넌트, 라이브러리 임포트
import {useEffect, useRef, useState} from "react";
import style from './Main.module.css';
import ChatRoom from "../ChatRoom/ChatRoom";
import Chat from "../Chat/Chat";
import ChatMember from "../ChatMember/ChatMember";
import {Client} from '@stomp/stompjs'; // STOMP 클라이언트
import ApiClient from "../../Api/ApiClient"; // Axios 기반 API 클라이언트

const MainPage = () => {
    // 💬 현재 선택된 채팅방 (ChatRoom에서 클릭 → Chat에 전달)
    const [selectedChat, setSelectedChat] = useState();

    // 💌 채팅방 ID별 메시지를 저장하는 상태 객체
    const [messages, setMessages] = useState({});

    // 🧠 STOMP 클라이언트를 저장할 ref (재렌더링 방지) / 연결된 클라이언트는 client.current에 보관
    const clientRef = useRef(null);

    const selectedChatRef = useRef(null);


    // ✅ 채팅방 클릭 시 호출되는 콜백 함수
    const handleChatRoom = (chatData) => {
        setSelectedChat(chatData); // 선택된 채팅방 정보 저장
        selectedChatRef.current=chatData;
    };
    // 📦 로그인한 사용자가 참여 중인 채팅방 목록을 저장하는 상태 변수
    const [chatRoom, setChatRoom] = useState([]);
    // 📥 서버에서 채팅방 목록을 가져오는 함수
    const fetchChatRooms = () => {
        ApiClient.get("/chatroom").then(resp => {
            setChatRoom(resp.data);

            // 💡 채팅방 리스트 불러온 후 방마다 구독 다시 걸기
            if (clientRef.current && clientRef.current.connected) {
                resp.data.forEach(room => {
                    subscribeToRoom(room.id);
                });
            }
        });
    };


    // 🧠 STOMP WebSocket 연결 및 구독 처리
    useEffect(() => {
        // ✅ 로컬스토리지에서 JWT 토큰 꺼내기
        const token = localStorage.getItem("accessToken");

        // ✅ STOMP 클라이언트 인스턴스 생성
        const client = new Client({
            brokerURL: "ws://172.20.10.3:80/ws", // 👉 WebSocket 연결 주소 (서버에 따라 ws:// or wss://)
            connectHeaders: {
                Authorization: `Bearer ${token}` // 👉 JWT 토큰을 헤더에 포함시켜 서버 인증
            },
            reconnectDelay: 5000, // 👉 연결 끊기면 5초마다 재시도
            // debug: (str) => console.log("[STOMP]", str), // 디버그 로그 출력

            // ✅ 연결 성공 시 실행될 콜백
            onConnect: () => {
                console.log("✅ STOMP 연결 성공");

                // 채팅방 목록 불러오기
                ApiClient("/chatroom").then((resp) => {
                    // 채팅방마다 구독 설정
                    resp.data.forEach((room) => {
                        const topic = `/topic/chat/${room.id}`; // ex) /topic/chat/1

                        // 해당 채팅방 메시지를 수신하면 처리
                        client.subscribe(topic, (message) => {
                            const msg = JSON.parse(message.body);

                            // 채팅방별로 메시지 배열에 누적 저장
                            setMessages((prev) => ({
                                ...prev,
                                [msg.chatroomId]: [...(prev[msg.chatroomId] || []), msg],
                            }));
                        });
                    });
                });
                // ✅ [방 삭제 알림] 구독
                client.subscribe("/topic/roomDeleted", (message) => {
                    const payload = JSON.parse(message.body);   // { roomid: 5 }
                    const deletedRoomId = payload.roomid;        // 🔥 제대로 id만 꺼내야 한다!!
                    console.log("🔥 방 삭제 알림:", deletedRoomId);

                    if (selectedChatRef.current?.id === deletedRoomId) {
                        alert('이 채팅방은 삭제되었습니다.');
                        setSelectedChat(null);
                        selectedChatRef.current = null;    // ✅ ref 초기화
                    }
                    fetchChatRooms();                // 방 목록 새로고침
                });

                client.subscribe("/topic/chatroom/created", (message) => {
                    console.log("🔥 새 채팅방 생성 알림:", JSON.parse(message.body));
                    fetchChatRooms();  // 🔄 목록 새로고침
                });


                console.log("✅ 삭제 알림 구독 완료");
            },

            // ❌ WebSocket 연결 중 에러 발생 시
            onStompError: (frame) => {
                console.error("❌ STOMP 에러:", frame.headers['message']);
            }
        });

        // 👉 실제 WebSocket 연결 시작
        client.activate();

        // stomp 클라이언트를 ref에 저장 (Chat 컴포넌트에서 메시지 보낼 때 사용 가능)
        clientRef.current = client;

        // 🔚 컴포넌트 언마운트 시 연결 해제
        return () => {
            if (client.connected) client.deactivate();
        };
    }, []);

    const subscribeToRoom = (roomId) => {
        if (clientRef.current && clientRef.current.connected) {
            const topic = `/topic/chat/${roomId}`;

            clientRef.current.subscribe(topic, (message) => {
                const msg = JSON.parse(message.body);
                setMessages((prev) => ({
                    ...prev,
                    [msg.chatroomId]: [...(prev[msg.chatroomId] || []), msg],
                }));
            });

            console.log(`✅ 방 ID ${roomId}에 구독 완료`);
        } else {
            console.warn("🚨 WebSocket 연결 안 되어 있음");
        }
    };
    const unSubscribeToRoom = (roomId) => {
        if (clientRef.current && clientRef.current.connected) {
            const topic = `/topic/chat/${roomId}`;

            clientRef.current.unsubscribe(topic);
            console.log("구독해제 완료");
        }
    }

    // 🧱 UI 구성: 좌측 채팅방 목록 / 중앙 채팅창 / 우측 참여자 목록
    return (
        <div className={style.container}>
            <ChatRoom selectedRoom={handleChatRoom} subscribeToRoom={subscribeToRoom}
                      unSubScribeToRoom={unSubscribeToRoom} fetchChatRooms={fetchChatRooms} setChatRoom={setChatRoom}
                      chatRoom={chatRoom} messages={messages}/>
            <Chat
                selectedChat={selectedChat}                         // 현재 선택된 채팅방 정보
                messages={messages[selectedChat?.id] || []}         // 선택된 방의 메시지 배열
                client={clientRef.current}
                fetchChatRooms={fetchChatRooms}
                unSubscribeToRoom={unSubscribeToRoom}
                setSelectedChat={setSelectedChat}// STOMP 클라이언트 인스턴스
            />
            <ChatMember selectedChat={selectedChat}/>
        </div>
    );
};

export default MainPage;
