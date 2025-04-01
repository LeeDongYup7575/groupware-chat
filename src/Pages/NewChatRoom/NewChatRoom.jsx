import style from './NewChatRoom.module.css'
import ApiClient from "../../Api/ApiClient";
import {useEffect, useState} from "react";


const NewChatRoom = ({onClose,onSuccess}) => {
    const [addList, setAddList] = useState([]);
    const [roomName, setRoomName] = useState("");
    const [selectUser, setSelectUser] = useState([]);
    useEffect(() => {
        ApiClient.get("/chatroom/getaddlist").then(resp => {
            setAddList(resp.data);
        })
    }, []);

    const handleSelect = (id) => {
        setSelectUser(prev => {
            if (prev.includes(id)) {
                return prev.filter(userId => userId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleRoomNameChange = (e) => {
        setRoomName(e.target.value);
    }
    const handleAdd = () => {
        const data = {
            name: roomName,
            members: selectUser // 여기에는 선택된 이름 목록이 들어감
        };
        console.log(data.name + " : 이름" + data.members + " : 멤버들")
        ApiClient.post("/chatroom/addroom", data,{
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(resp => {
                console.log(resp);
                onSuccess();
                onClose();
            });
    };

    return (
        <div className={style.container}>
            <div className={style.header}>
                대화상대 선택
                <div className={style.chatRoomName}>
                    <input type="text" onChange={handleRoomNameChange} placeholder="채팅방이름"/>
                </div>
                {/*<div className={style.searchInput}>*/}
                {/*    <input type="text" placeholder="이름 검색"/>*/}
                {/*    <button>검색</button>*/}
                {/*    /!*<button>검색</button>*!/*/}
                {/*</div>*/}
            </div>
            <div className={style.body}>
                {addList.map((list, i) => (
                    <button
                        key={i}
                        onClick={() => handleSelect(list.id)}
                        className={selectUser.includes(list.id) ? style.selected : ''}
                    >
                        {list.name}
                    </button>
                ))}

            </div>
            <button onClick={handleAdd}>채팅방 만들기</button>
        </div>
    )
}
export default NewChatRoom;