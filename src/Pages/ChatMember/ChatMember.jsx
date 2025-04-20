// 📦 스타일(CSS 모듈) 불러오기
import style from "./ChatMember.module.css";

// 📦 React 훅, axios 클라이언트 불러오기
import { useEffect, useState } from "react";
import ApiClient from "../../Api/ApiClient";

// ✨ ChatMember 컴포넌트 (채팅방에 참여 중인 인원 목록 표시)
const ChatMember = ({ selectedChat }) => {
    const [userList, setUserList] = useState([]);

    // ✅ 채팅방 선택 시 참여자 목록 불러오기
    useEffect(() => {
        if (!selectedChat) return;
        ApiClient.get(`/membership/getuserlist?roomId=${selectedChat.id}`)
            .then(resp => setUserList(resp.data))
            .catch(err => console.error("❗ 참여자 목록 불러오기 실패:", err));
    }, [selectedChat]);

    // ✅ 채팅방이 선택되지 않았을 경우
    if (!selectedChat) {
        return (
            <div className={style.chatmembersection}>
                <div className={style.chatmembersheader}>채팅방을 선택하세요</div>
            </div>
        );
    }

    // ✅ 채팅방 참여자 리스트 렌더링
    return (
        <div className={style.chatmembersection}>
            <div className={style.chatmembers}>
                <div className={style.chatmembersheader}>
                    참여인원 : {userList.length}
                </div>
                {userList.map((user) => (
                    <div className={style.chatmemberlist} key={user.id}>
                        <div className={style.chatmemberimg}>
                            <img
                                src={user.profileImgUrl.startsWith("http")
                                    ? user.profileImgUrl
                                    : `http://172.20.10.3:80${user.profileImgUrl}`}
                                alt="프로필"
                            />
                        </div>
                        <div className={style.chatmembercontent}>
                            <div className={style.chatmembername}>
                                {user.name}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatMember;
