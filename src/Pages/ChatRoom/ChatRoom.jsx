import style from "./ChatRoom.module.css";
import axios from 'axios'
import {useEffect, useState} from "react";
import {useLocation} from "react-router-dom";
import ApiClient from "../../Api/ApiClient";

const ChatRoom = ({selectedRoom}) => {

    // 현재 로그인한 사람의 채팅방 가져오기
    const [chatRoom, setChatRoom] = useState([]);

    // 모달 상태 관리
    const [showModal, setShowModal] = useState(false);

    // 처음 화면 마운트시 존재하는 채팅방 뿌려주기
    const fetchChatRooms = () => {
        ApiClient.get("/chatroom").then(resp => {
            setChatRoom(resp.data);
        });
    };

    useEffect(() => {
        fetchChatRooms();
    }, []);
    // 채팅방 추가기능
    const handleAddChatRoom = (room) => {
        selectedRoom({id: room.id, name: room.name});
    }
    const handleChat = async (room) => {
        const chatData = {
            id: room.id,
            name: room.name,
        };
        selectedRoom(chatData);
        console.log(room.id + " : " + room.name);
    }
    return (
        <div className={style.chatroomsection}>
            <div className={style.logo}>
                로고
            </div>
            <div className={style.chatroomheader}>
                새로운 알림 : 12
                <button onClick={handleAddChatRoom}>+</button>
            </div>
            <div className={style.chatroomlist}>
                <div className={style.search}>
                    <input type="text" placeholder="대상 검색"></input>
                    <button>찾기</button>
                </div>

                {chatRoom.map((room, i) => (
                    <div className={style.list}>
                        <div className={style.chatlist} onClick={() => handleChat(room)}>
                            <div className={style.chatroomimg}> 이미지</div>
                            <div className={style.chatroomdetail}>
                                <div className={style.chatroomname}>
                                    {room.name}
                                </div>
                                <div className={style.chatroomcontent}>
                                    내용
                                </div>
                            </div>
                            <div className={style.chatroomsendtime}> 1m</div>
                        </div>
                    </div>

                ))}
            </div>
        </div>
    );
}
export default ChatRoom;