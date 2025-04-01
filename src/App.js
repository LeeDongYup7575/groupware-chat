import './App.css';
import { Route, Routes, useSearchParams } from "react-router-dom";
import Main from "./Pages/Main/Main";
import NewChatRoom from "./Pages/NewChatRoom/NewChatRoom";
import { useEffect } from "react";

function App() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    useEffect(() => {
        if (token) {
            localStorage.setItem('accessToken', token);
        }
    }, [token]);

    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<Main/>}></Route>
                <Route path="/new-chat-room" element={<NewChatRoom />} />
            </Routes>
        </div>
    );
}

export default App;
