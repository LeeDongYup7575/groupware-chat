import style from "./ChatMember.module.css";
import {useEffect, useState} from "react";
import ApiClient from "../../Api/ApiClient";

const ChatMember = ({selectedChat}) => {
    const [userList, setUserList] = useState([]);

    const fetchUserList = () => {
        ApiClient.get(`/membership/getuserlist?roomId=${selectedChat.id}`).then(resp => {
            setUserList(resp.data);
            console.log("유저리스트 불러오기 완료");
            console.log(resp.data);
        })
    }

    useEffect(() => {
        if (!selectedChat) {
            return;
        }
        fetchUserList();
    }, [selectedChat]);
    if (!selectedChat) {
        return (
            <div className={style.chatmembersection}>
                <div className={style.chatmembersheader}>
                    채팅방을 선택하세요
                </div>
            </div>
        );
    }


    return (
        <div className={style.chatmembersection}>
            <div className={style.chatmembers}>
                <div className={style.chatmembersheader}>
                    참여인원 : {userList.length}
                </div>
                {userList.map((user, i) => (
                    <div className={style.chatmemberlist} key={i}>
                        <div className={style.chatmemberimg}>
                            이미지
                        </div>
                        <div className={style.chatmembercontent}>
                            <div className={style.chatmembername}>
                                {user.name}
                            </div>
                            <div className={style.chatmemberdesc}>

                            </div>
                        </div></div>
                ))}

            </div>
            {/*<div className={style.chatmemberfiles}>*/}
            {/*    <div className={style.filesheader}>*/}
            {/*        업로드 파일*/}
            {/*    </div>*/}
            {/*    <div className={style.filelist}>*/}
            {/*        <div className={style.fileimg}>파일 이미지</div>*/}
            {/*        <div className={style.filename}>파일 이름</div>*/}
            {/*        <div className={style.filedownload}>파일 다운로드</div>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </div>
    )
}
export default ChatMember;