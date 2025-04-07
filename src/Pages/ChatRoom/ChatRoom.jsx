// CSS 모듈 임포트 - ChatRoom.module.css 안의 스타일 클래스 사용
import style from "./ChatRoom.module.css";

// axios는 일반 요청용 (현재 사용 안함, ApiClient 사용 중)
import axios from 'axios'

// React 훅
import {useEffect, useState} from "react";

// 라우팅 관련 훅 (지금은 사용 안 하고 있음)
import {useLocation} from "react-router-dom";

// API 요청용 커스텀 axios 클라이언트
import ApiClient from "../../Api/ApiClient";

// 채팅방 생성 모달 컴포넌트
import NewChatRoom from "../NewChatRoom/NewChatRoom";

const ChatRoom = ({ selectedRoom, subscribeToRoom, setChatRoom, fetchChatRooms, chatRoom, messages }) => {
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (search === "") {
            fetchChatRooms();
        }
    }, [search]);

    const handleChat = (room) => {
        const chatData = {
            id: room.id,
            name: room.name,
        };
        selectedRoom(chatData);
        console.log(room.id + " : " + room.name);
    };

    const handleSearch = () => {
        if (search === "") {
            return alert("검색할 내용을 입력해주세요.");
        }
        ApiClient.get("/chatroom/search", { params: { target: search } }).then(resp => {
            console.log(resp.data);
            setChatRoom(resp.data);
        });
    };

    const getLastMessage = (roomId) => {
        const roomMessages = messages[roomId];
        if (!roomMessages || roomMessages.length === 0) {
            return { lastContent: "아직 대화내용이 없습니다.", lastTime: "" };
        }
        const lastMessage = roomMessages[roomMessages.length - 1];
        return { lastContent: lastMessage.content, lastTime: formatTime(lastMessage.sentAt) };
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffMinutes < 1) return "방금 전";
        if (diffMinutes < 60) return `${diffMinutes}분 전`;
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}시간 전`;
        return date.toLocaleDateString();
    };

    // ✅ return은 이 안에서 해야 해!
    return (
        <div className={style.chatroomsection}>
            <div className={style.logo}>로고</div>

            <div className={style.chatroomheader}>
                참여중인 채팅방 목록
                <button onClick={() => setShowModal(true)}>+</button>
            </div>

            <div className={style.chatroomlist}>
                <div className={style.search}>
                    <input type="text" placeholder="채팅방 이름 검색" onChange={(e) => setSearch(e.target.value)} />
                    <button onClick={handleSearch}>찾기</button>
                </div>

                {Array.isArray(chatRoom) && chatRoom.map((room, i) => {
                    const { lastContent, lastTime } = getLastMessage(room.id); // 🔥 여기서 뽑아
                    return (
                        <div className={style.list} key={i}>
                            <div className={style.chatlist} onClick={() => handleChat(room)}>
                                <div className={style.chatroomimg}>이미지</div>
                                <div className={style.chatroomdetail}>
                                    <div className={style.chatroomname}>
                                        {room.name}
                                    </div>
                                    <div className={style.chatroomcontent}>
                                        {lastContent} {/* 🔥 최근 메시지 내용 */}
                                    </div>
                                </div>
                                <div className={style.chatroomsendtime}>
                                    {lastTime} {/* 🔥 최근 메시지 시간 */}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showModal && (
                <NewChatRoom
                    onClose={() => setShowModal(false)}
                    onSuccess={(newRoom) => {
                        fetchChatRooms();
                        selectedRoom({ id: newRoom.id, name: newRoom.name });
                        subscribeToRoom(newRoom.id);
                        setShowModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default ChatRoom;
