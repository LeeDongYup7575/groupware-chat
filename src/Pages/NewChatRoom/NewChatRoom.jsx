// CSS 모듈 import (모달 관련 스타일 정의된 파일)
import style from './NewChatRoom.module.css'

// axios 기반 API 요청 클라이언트
import ApiClient from "../../Api/ApiClient";

// React 훅 import
import {useEffect, useState} from "react";

// ➕ 채팅방 생성용 모달 컴포넌트
// onClose: 모달 닫기 함수 / onSuccess: 방 생성 후 처리 함수
const NewChatRoom = ({onClose, onSuccess}) => {
    // 📦 추가 가능한 직원 리스트 (API로 받아옴)
    const [addList, setAddList] = useState([]);

    // 🏷️ 입력된 채팅방 이름 상태
    const [roomName, setRoomName] = useState("");

    // ✅ 선택된 사용자 ID 배열
    const [selectUser, setSelectUser] = useState([]);

    // 🔁 컴포넌트 마운트 시 참여자 목록을 서버에서 불러옴
    useEffect(() => {
        ApiClient.get("/chatroom/getaddlist").then(resp => {
            setAddList(resp.data); // 서버로부터 받은 직원 목록 저장
        });
    }, []);

    // ✅ 사용자 버튼 클릭 시 선택/해제 처리
    const handleSelect = (id) => {
        setSelectUser(prev => {
            // 이미 선택된 유저라면 제거, 아니면 추가
            if (prev.includes(id)) {
                return prev.filter(userId => userId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // 🖊️ 채팅방 이름 입력 핸들러
    const handleRoomNameChange = (e) => {
        setRoomName(e.target.value);
    };

    // 💾 채팅방 생성 API 호출
    const handleAdd = () => {
        const data = {
            name: roomName,
            members: selectUser // 선택된 사용자 ID 배열
        };
        if (data.members.length === 0) {
            alert("채팅방 참여자를 선택해주세요")
            return;
        }
        if (!data.name.trim()) {
            alert("채팅방 이름을 선택해주세요")
            return;
        }
        console.log(data.name + " : 이름, " + data.members + " : 멤버들");

        ApiClient.post("/chatroom/addroom", data, {
            headers: {
                "Content-Type": "application/json"
            }
        }).then(resp => {
            // const roomId = resp.data.id;
            // const topic = `/topic/chat/${roomId}`;
            // client.subscribe(topic,)
            console.log(resp); // 응답 콘솔 확인
            onSuccess();       // 채팅방 생성 후 목록 새로고침 등 처리
            onClose();         // 모달 닫기
        });
    };

    // 🧱 모달 UI 구성
    return (
        // ✴️ 모달 배경 클릭 시 모달 닫기
        <div className={style.modalBackground} onClick={onClose}>
            {/* 모달 내용 클릭 시 배경 클릭 이벤트 버블링 방지 */}
            <div className={style.modalContainer} onClick={(e) => e.stopPropagation()}>
                <h2>채팅방 만들기</h2>

                {/* 🏷️ 채팅방 이름 입력창 */}
                <div className={style.chatRoomName}>
                    <input type="text" onChange={handleRoomNameChange} placeholder="채팅방 이름"/>
                </div>

                {/* 👥 사용자 선택 버튼 목록 */}
                <div className={style.body}>
                    {addList.map((list, i) => (
                        <button
                            key={i}
                            onClick={() => handleSelect(list.id)} // 클릭 시 선택/해제
                            className={selectUser.includes(list.id) ? style.selected : ''} // 선택 시 스타일 적용
                        >
                            {list.name}
                        </button>
                    ))}
                </div>

                {/* ✅ 채팅방 만들기 버튼 */}
                <button onClick={handleAdd}>채팅방 만들기</button>
            </div>
        </div>
    );
};

// 외부에서 사용할 수 있도록 컴포넌트 export
export default NewChatRoom;
