// 📦 CSS 모듈 import (채팅방 스타일)
import style from "./ChatRoom.module.css";

// 📦 React 훅, API 클라이언트 import
import {useEffect, useState} from "react";
import ApiClient from "../../Api/ApiClient";

// ➕ 새 채팅방 생성 모달 컴포넌트 import
import NewChatRoom from "../NewChatRoom/NewChatRoom";

// ✨ ChatRoom 컴포넌트
const ChatRoom = ({selectedRoom, subscribeToRoom, setChatRoom, fetchChatRooms, chatRoom, messages, unreadCounts}) => {
    // ✅ 새 채팅방 모달 상태
    const [showModal, setShowModal] = useState(false);

    // ✅ 검색어 상태
    const [search, setSearch] = useState("");

    // ✅ 로딩 상태
    const [loading, setLoading] = useState(false);

    // ✅ 채팅방 리스트 불러오기 (검색어가 비어있을 때)
    useEffect(() => {
        if (search === "") {
            setLoading(true);    // 로딩 시작
            fetchChatRooms().finally(() => setLoading(false));    // 로딩 끝
        }
    }, [search]);

    // ✅ 채팅방 클릭 시 (선택한 방 정보 넘겨줌)
    const handleChat = (room) => {
        const chatData = {id: room.id, name: room.name};
        selectedRoom(chatData);
    };

    // ✅ 채팅방 검색
    const handleSearch = () => {
        if (search === "") {
            return alert("검색할 내용을 입력해주세요.");
        }
        setLoading(true); // 로딩 시작
        ApiClient.get("/chatroom/search", {params: {target: search}})
            .then(resp => {
                setChatRoom(resp.data);   // 검색 결과 저장
            })
            .catch(error => {
                console.error("❗ 검색 실패:", error);
                alert("검색 실패. 다시 시도해주세요.");
            })
            .finally(() => {
                setLoading(false);  // 로딩 끝
            });
    };

    // ✅ 최근 메시지 시간을 보기 좋게 포맷팅
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

    // ✅ 화면 렌더링
    return (
        <div className={style.chatroomsection}>
            {/* 🔷 상단 로고 */}
            <div className={style.logo}>로고</div>

            {/* 🔷 채팅방 헤더 + 채팅방 추가 버튼 */}
            <div className={style.chatroomheader}>
                참여중인 채팅방 목록
                <button onClick={() => setShowModal(true)}>+</button>
            </div>

            {/* 🔷 채팅방 목록 영역 */}
            <div className={style.chatroomlist}>

                {/* 🔹 채팅방 검색 영역 */}
                <div className={style.search}>
                    <input
                        type="text"
                        placeholder="채팅방 이름 검색"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button onClick={handleSearch}>찾기</button>
                </div>

                {/* 🔹 채팅방 리스트 표시 */}
                {loading ? (
                    // ✅ 로딩 중일 때
                    <div>로딩 중입니다...</div>
                ) : Array.isArray(chatRoom) && chatRoom.length > 0 ? (
                    // ✅ 채팅방이 있을 때
                    chatRoom.map((room, i) => (
                        <div className={style.list} key={i}>
                            <div className={style.chatlist} onClick={() => handleChat(room)}>
                                <div className={style.chatroomimg}>이미지</div>
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
                                    {room.lastMessageTime ? formatTime(room.lastMessageTime) : ''}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    // ✅ 채팅방이 없을 때
                    <div>참여 중인 채팅방이 없습니다.</div>
                )}
            </div>

            {/* 🔷 새 채팅방 생성 모달 */}
            {showModal && (
                <NewChatRoom
                    onClose={() => setShowModal(false)}  // 모달 닫기
                    onSuccess={(newRoom) => {
                        fetchChatRooms();                // 채팅방 목록 새로고침
                        selectedRoom({id: newRoom.id, name: newRoom.name});  // 방 선택
                        subscribeToRoom(newRoom.id);     // 새로 만든 방 구독
                        setShowModal(false);             // 모달 닫기
                    }}
                />
            )}
        </div>
    );
};

// ✨ 외부에서 사용할 수 있도록 export
export default ChatRoom;
