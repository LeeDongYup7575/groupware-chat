// 📦 스타일(CSS 모듈) 불러오기
import style from "./ChatMember.module.css";

// 📦 React 훅, axios 클라이언트 불러오기
import { useEffect, useState } from "react";
import ApiClient from "../../Api/ApiClient";

// ✨ ChatMember 컴포넌트 (채팅방에 참여 중인 인원 목록 표시)
const ChatMember = ({ selectedChat }) => {

    // ✅ 채팅방에 참여 중인 사용자 리스트 상태
    const [userList, setUserList] = useState([]);

    // ✅ 채팅방이 선택될 때 참여자 리스트 가져오기
    useEffect(() => {
        if (!selectedChat) return;  // 채팅방 선택 안 했으면 요청 안 함
        ApiClient.get(`/membership/getuserlist?roomId=${selectedChat.id}`).then(resp => {
            setUserList(resp.data);  // 참여자 리스트 저장
        });
    }, [selectedChat]);

    // ✅ 채팅방을 선택하지 않았을 때 보여줄 화면
    if (!selectedChat) {
        return (
            <div className={style.chatmembersection}>
                <div className={style.chatmembersheader}>채팅방을 선택하세요</div>
            </div>
        );
    }

    // ✅ 채팅방이 선택되었을 때 참여자 리스트 출력
    return (
        <div className={style.chatmembersection}>
            <div className={style.chatmembers}>
                {/* 참여자 수 출력 */}
                <div className={style.chatmembersheader}>
                    참여인원 : {userList.length}
                </div>
                {/* 참여자 목록 반복 렌더링 */}
                {userList.map((user, i) => (
                    <div className={style.chatmemberlist} key={i}>
                        <div className={style.chatmemberimg}>
                            이미지
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

// ✨ 외부에서 사용 가능하게 export
export default ChatMember;
