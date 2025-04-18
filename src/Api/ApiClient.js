// ✅ Axios 라이브러리 import
import axios from "axios";

// ✅ Axios 인스턴스 생성
// 모든 API 요청에 기본 서버 URL을 자동으로 prefix로 붙여줌
const ApiClient = axios.create({
    baseURL: "http://groupware.techx.kro.kr:80", // 서버 주소 (IP 또는 도메인)
});

// ✅ 요청 인터셉터 설정
// 요청을 보낼 때마다 실행됨 (자동으로 헤더 추가 가능)
ApiClient.interceptors.request.use(
    (config) => {
        // 🔹 로컬스토리지에 저장된 JWT 토큰 가져오기
        const token = localStorage.getItem("accessToken");

        // 🔹 토큰이 있으면 Authorization 헤더에 추가
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // 🔹 수정된 config 반환 (요청이 서버로 나감)
        return config;
    },
    (error) => {
        // 🔹 요청 만들기 실패 시 에러 바로 반환
        return Promise.reject(error);
    }
);

// ✅ 외부에서 사용할 수 있도록 export
export default ApiClient;
