import style from "./ChatRoom.module.css";
import { useEffect, useState } from "react";
import ApiClient from "../../Api/ApiClient";
import NewChatRoom from "../NewChatRoom/NewChatRoom";

const ChatRoom = ({
                      selectedRoom,
                      subscribeToRoom,
                      setChatRoom,
                      fetchChatRooms,
                      chatRoom,
                      messages,
                      unreadCounts
                  }) => {
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search.trim() === "") {
                setLoading(true);
                fetchChatRooms().finally(() => setLoading(false));
            } else {
                setLoading(true);
                ApiClient.get("/chatroom/search", { params: { target: search } })
                    .then((resp) => {
                        setChatRoom(resp.data);
                    })
                    .catch((error) => {
                        console.error("❗ 검색 실패:", error);
                        alert("검색 실패. 다시 시도해주세요.");
                    })
                    .finally(() => setLoading(false));
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const handleSearch = () => {
        if (search.trim() === "") {
            alert("검색할 내용을 입력해주세요.");
            return;
        }

        setLoading(true);
        ApiClient.get("/chatroom/search", { params: { target: search } })
            .then((resp) => {
                setChatRoom(resp.data);
            })
            .catch((error) => {
                console.error("❗ 검색 실패:", error);
                alert("검색 실패. 다시 시도해주세요.");
            })
            .finally(() => setLoading(false));
    };

    const handleChat = (room) => {
        const chatData = { id: room.id, name: room.name };
        selectedRoom(chatData);
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

    return (
        <div className={style.chatroomsection}>
            <div className={style.logo}>
                <img src={`${process.env.PUBLIC_URL}/bigLogo.png`} alt="로고" />
            </div>

            <div className={style.chatroomheader}>
                참여중인 채팅방 목록
                <button onClick={() => setShowModal(true)}>+</button>
            </div>

            {/* 🔥 검색창 + 리스트 래퍼 */}
            <div className={style.chatroomlistWrapper}>
                {/* 검색창 고정 */}
                <div className={style.search}>
                    <input
                        type="text"
                        placeholder="채팅방 이름 검색"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSearch();
                            }
                        }}
                    />
                    <button onClick={handleSearch}>찾기</button>
                </div>

                {/* 채팅방 목록만 스크롤 */}
                <div className={style.chatroomlist}>
                    {loading ? (
                        <div>로딩 중입니다...</div>
                    ) : Array.isArray(chatRoom) && chatRoom.length > 0 ? (
                        chatRoom.map((room, i) => (
                            <div className={style.list} key={i}>
                                <div className={style.chatlist} onClick={() => handleChat(room)}>
                                    <div className={style.chatroomdetail}>
                                        <div className={style.chatroomname}>
                                            <span>{room.name}</span>
                                            {unreadCounts?.[room.id] > 0 && (
                                                <span className={style.unreadCount}>
                                                    {unreadCounts[room.id] > 99 ? "99+" : unreadCounts[room.id]}
                                                </span>
                                            )}
                                        </div>
                                        <div className={style.chatroomcontent}>
                                            {room.lastMessage || "아직 대화내용이 없습니다."}
                                        </div>
                                    </div>
                                    <div className={style.chatroomsendtime}>
                                        {room.lastMessageTime ? formatTime(room.lastMessageTime) : ""}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div>참여 중인 채팅방이 없습니다.</div>
                    )}
                </div>
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
