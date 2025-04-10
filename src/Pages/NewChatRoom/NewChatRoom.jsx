// ✅ 필요한 라이브러리 및 컴포넌트 import
import style from './NewChatRoom.module.css';
import ApiClient from "../../Api/ApiClient";    // API 요청용 커스텀 Axios
import { useEffect, useState } from "react";

// ✨ NewChatRoom (채팅방 생성 모달 컴포넌트)
const NewChatRoom = ({ onClose, onSuccess }) => {
    // ✅ 추가 가능한 직원 리스트
    const [addList, setAddList] = useState([]);

    // ✅ 입력 중인 채팅방 이름
    const [roomName, setRoomName] = useState("");

    // ✅ 선택된 사용자 ID 배열
    const [selectUser, setSelectUser] = useState([]);

    // ✅ 모달이 열릴 때 참여자 목록 불러오기
    useEffect(() => {
        ApiClient.get("/chatroom/getaddlist").then(resp => {
            setAddList(resp.data);
        });
    }, []);

    // ✅ 사용자 선택/해제 핸들러
    const handleSelect = (id) => {
        setSelectUser(prev =>
            prev.includes(id)
                ? prev.filter(userId => userId !== id)  // 이미 선택되어 있으면 제거
                : [...prev, id]                         // 없으면 추가
        );
    };

    // ✅ 채팅방 이름 입력 핸들러
    const handleRoomNameChange = (e) => {
        setRoomName(e.target.value);
    };

    // ✅ 채팅방 생성 버튼 클릭 핸들러
    const handleAdd = () => {
        const data = {
            name: roomName,
            members: selectUser
        };

        // 🔹 예외 처리: 필수 항목 검사
        if (data.members.length === 0) {
            alert("채팅방 참여자를 선택해주세요");
            return;
        }
        if (!data.name.trim()) {
            alert("채팅방 이름을 입력해주세요");
            return;
        }

        // 🔹 서버에 채팅방 생성 요청
        ApiClient.post("/chatroom/addroom", data, {
            headers: { "Content-Type": "application/json" }
        }).then(resp => {
            const newRoom = {
                id: resp.data.id,
                name: resp.data.name
            };
            onSuccess(newRoom);  // 부모 컴포넌트에 새 채팅방 알리기
            onClose();           // 모달 닫기
        });
    };

    // ✅ 렌더링
    return (
        <div className={style.modalBackground} onClick={onClose}>
            {/* 모달 내부 클릭 시 닫히지 않게 막기 */}
            <div className={style.modalContainer} onClick={(e) => e.stopPropagation()}>
                <h2>채팅방 만들기</h2>

                {/* 🔹 채팅방 이름 입력 */}
                <div className={style.chatRoomName}>
                    <input
                        type="text"
                        onChange={handleRoomNameChange}
                        placeholder="채팅방 이름"
                    />
                </div>

                {/* 🔹 참여자 선택 버튼 목록 */}
                <div className={style.body}>
                    {addList.map((user, i) => (
                        <button
                            key={i}
                            onClick={() => handleSelect(user.id)}
                            className={selectUser.includes(user.id) ? style.selected : ''}
                        >
                            {user.name}
                        </button>
                    ))}
                </div>

                {/* 🔹 채팅방 생성 버튼 */}
                <button onClick={handleAdd}>채팅방 만들기</button>
            </div>
        </div>
    );
};

// ✨ 외부에서 사용할 수 있도록 export
export default NewChatRoom;
