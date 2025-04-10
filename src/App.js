import './App.css';
import { Route, Routes, useSearchParams } from "react-router-dom";
import Main from "./Pages/Main/Main";
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
                <Route path="/" element={<Main/>}></Route> {/* ✅ 메인만 필요 */}
            </Routes>
        </div>
    );
}

export default App;
