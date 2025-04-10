import {useEffect, useRef} from "react";
import {useChatStore} from "../Store/chatStore";
import {Client} from '@stomp/stompjs'
import ApiClient from "../Api/ApiClient";

export const useWebSocket = () => {
    const clientRef = useRef(null);
    const {setChatRooms, setUnreadCounts, addMessages, setClient, selectedChat, setSelectedChat} = useChatStore();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const client = new Client({
            brokerURL: "ws://10.10.55.57:80/ws",
            connectHeaders: {Authorization: `Bearer ${token}`},
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("WebSocket Connected");
                setClient(client);
                fetchChatRooms();

                client.subscribe(`/topic/roomDeleted`, (message) => {
                    const payload = JSON.parse(message.body);
                    if (selectedChat?.id === payload.roomid) {
                        alert("이 채팅방은 삭제되었습니다.");
                        setSelectedChat(null);
                    }
                    fetchChatRooms();
                });
                client.subscribe(`/topic/chatroom/created`, () => {
                    fetchChatRooms();
                });
                ;
            },
            onStompError: (frame) => {
                console.error("websocket오류", frame);
            }
        });
        client.activate();
        clientRef.current = client;
        const fetchChatRooms = async () => {
            const resp = await ApiClient.get("/chatroom");
            setChatRooms(resp.data || []);
            const unreadResp = await ApiClient.get("/unread/count");
            setUnreadCounts(unreadResp.data);

            if (clientRef.current?.connected) {
                (resp.data || []).forEach(room => {
                    clientRef.current.subscribe(`/topic/chat/${room.id}`, (message) => {
                        const msg = JSON.parse(message.body);
                        addMessages(msg.chatroomId, msg);
                    })
                })
            }
        };
        return () => {
            if (clientRef.current?.connected) clientRef.current.deactivate();
        }
    }, [selectedChat]);
}