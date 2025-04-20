import style from "./ChatMember.module.css";
import { useEffect, useState } from "react";
import ApiClient from "../../Api/ApiClient";

const ChatMember = ({ selectedChat }) => {
    const [userList, setUserList] = useState([]);
    const [showMembers, setShowMembers] = useState(false);

    useEffect(() => {
        if (!selectedChat) return;
        ApiClient.get(`/membership/getuserlist?roomId=${selectedChat.id}`)
            .then(resp => setUserList(resp.data))
            .catch(err => console.error("❗ 참여자 목록 불러오기 실패:", err));
    }, [selectedChat]);

    const isMobile = window.innerWidth <= 768;

    return (
        <>
            {/* ✅ 모바일에서만 토글 버튼 표시 */}
            {isMobile && (
                <button
                    className={style.toggleBtn}
                    onClick={() => setShowMembers(!showMembers)}
                >
                    {showMembers ? "참여자 닫기" : "참여자 보기"}
                </button>
            )}

            {/* ✅ 데스크탑에서는 항상 보이고, 모바일에서는 버튼 눌렀을 때만 보임 */}
            {(!isMobile || showMembers) && (
                <div className={style.chatmembersection}>
                    <div className={style.chatmembers}>
                        <div className={style.chatmembersheader}>
                            {selectedChat ? `참여인원 : ${userList.length}` : "채팅방을 선택하세요"}
                        </div>
                        {selectedChat &&
                            userList.map((user) => (
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
                                        <div className={style.chatmembername}>{user.name}</div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatMember;
