// CSS 모듈 임포트 - ChatRoom.module.css 안의 스타일 클래스 사용
import style from "./ChatRoom.module.css";

// axios는 일반 요청용 (현재 사용 안함, ApiClient 사용 중)
import axios from 'axios'

// React 훅
import { useEffect, useState } from "react";

// 라우팅 관련 훅 (지금은 사용 안 하고 있음)
import { useLocation } from "react-router-dom";

// API 요청용 커스텀 axios 클라이언트
import ApiClient from "../../Api/ApiClient";

// 채팅방 생성 모달 컴포넌트
import NewChatRoom from "../NewChatRoom/NewChatRoom";

// ChatRoom 컴포넌트 정의 - 채팅방 목록, 추가, 모달 등 처리
const ChatRoom = ({ selectedRoom }) => {

    // 📦 로그인한 사용자가 참여 중인 채팅방 목록을 저장하는 상태 변수
    const [chatRoom, setChatRoom] = useState([]);

    // 📦 모달 오픈 여부를 제어하는 상태 (true → 모달 열림)
    const [showModal, setShowModal] = useState(false);

    // 📥 서버에서 채팅방 목록을 가져오는 함수
    const fetchChatRooms = () => {
        ApiClient.get("/chatroom").then(resp => {
            // 응답 데이터를 상태에 저장
            setChatRoom(resp.data);
        });
    };

    // 🔁 컴포넌트가 처음 마운트될 때 채팅방 목록을 한 번 불러옴
    useEffect(() => {
        fetchChatRooms();
    }, []);

    // ✅ 채팅방 클릭 시 실행되는 함수 (해당 방의 정보를 상위 컴포넌트로 전달)
    const handleChat = async (room) => {
        const chatData = {
            id: room.id,
            name: room.name,
        };
        // 선택된 방 정보를 부모에게 넘겨줌 (상위에서 채팅창 열기)
        selectedRoom(chatData);
        console.log(room.id + " : " + room.name);
    }

    // 💡 렌더링 파트 시작
    return (
        <div className={style.chatroomsection}>
            {/* 좌측 상단 로고 */}
            <div className={style.logo}>
                로고
            </div>

            {/* 채팅방 목록 헤더 - 알림 + 채팅방 추가 버튼 */}
            <div className={style.chatroomheader}>
                새로운 알림 : 12
                {/* ➕ 버튼 클릭 시 모달 열기 */}
                <button onClick={() => setShowModal(true)}>+</button>
            </div>

            {/* 채팅방 목록 전체 영역 */}
            <div className={style.chatroomlist}>
                {/* 🔍 채팅방/대상 검색바 (현재 기능 미구현) */}
                <div className={style.search}>
                    <input type="text" placeholder="대상 검색" />
                    <button>찾기</button>
                </div>

                {/* 💬 채팅방 목록 출력 */}
                {chatRoom.map((room, i) => (
                    <div className={style.list} key={i}>
                        {/* 각 채팅방 항목 클릭 시 채팅 시작 */}
                        <div className={style.chatlist} onClick={() => handleChat(room)}>
                            <div className={style.chatroomimg}> 이미지</div>
                            <div className={style.chatroomdetail}>
                                <div className={style.chatroomname}>
                                    {room.name}
                                </div>
                                <div className={style.chatroomcontent}>
                                    {/*내용*/}
                                </div>
                            </div>
                            <div className={style.chatroomsendtime}>1m</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ➕ 채팅방 추가 모달 렌더링 조건부 표시 */}
            {showModal && (
                <NewChatRoom
                    // ❌ 모달 닫기 핸들러
                    onClose={() => setShowModal(false)}
                    // ✅ 채팅방 생성 성공 시: 목록 새로고침 + 모달 닫기
                    onSuccess={() => {
                        fetchChatRooms();
                        setShowModal(false);
                    }}
                />
            )}
        </div>
    );
};

// 컴포넌트 외부에서 사용할 수 있도록 export
export default ChatRoom;
