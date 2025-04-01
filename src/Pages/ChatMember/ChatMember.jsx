import style from "./ChatMember.module.css";

const ChatMember = () => {

    return (
        <div className={style.chatmembersection}>
            <div className={style.chatmembers}>
                <div className={style.chatmembersheader}>
                    참여인원 : 6
                </div>
                <div className={style.chatmemberlist}>
                    <div className={style.chatmemberimg}>
                        이미지
                    </div>
                    <div className={style.chatmembercontent}>
                        <div className={style.chatmembername}>
                            채팅 참여 멤버 이름
                        </div>
                        <div className={style.chatmemberdesc}>
                            채팅 참여 멤버 설명
                        </div>
                    </div>
                </div>
            </div>
            <div className={style.chatmemberfiles}>
                <div className={style.filesheader}>
                    업로드 파일
                </div>
                <div className={style.filelist}>
                    <div className={style.fileimg}>파일 이미지</div>
                    <div className={style.filename}>파일 이름</div>
                    <div className={style.filedownload}>파일 다운로드</div>
                </div>
            </div>
        </div>
    )
}
export default ChatMember;