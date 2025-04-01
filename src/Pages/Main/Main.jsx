import {Link, useLocation, useSearchParams} from "react-router-dom";
import style from './Main.module.css';
import ChatRoom from "../ChatRoom/ChatRoom";
import Chat from "../Chat/Chat";
import ChatMember from "../ChatMember/ChatMember";
import {useEffect, useState} from "react";

const MainPage = () => {
    const [selectedChat, setSelectedChat] = useState();
    const [stompclient,setStompClient] = useState();

    const handleChatRoom = (chatData) => {
        setSelectedChat(chatData);
    }
    // useEffect(() => {
    //     const client = new Client({
    //         brokerURL:"ws://localhost:80/ws",
    //         reconnectD
    //     })
    // }, []);

    return (
        <div className={style.container}>
            <ChatRoom selectedRoom={handleChatRoom}/>
            <Chat selectedChat={selectedChat}/>
            <ChatMember selectedChat={selectedChat}/>
        </div>
    )
}
export default MainPage;