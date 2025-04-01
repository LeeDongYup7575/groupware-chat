// axios 라이브러리 임포트 (HTTP 통신을 위한 라이브러리)
import axios from "axios";

// ✅ axios 인스턴스 생성 - 기본 설정 정의
const ApiClient = axios.create({
    // 모든 API 요청의 기본 URL 설정 (이 주소를 prefix로 붙임)
    baseURL: "http://10.10.55.57", // 예: http://10.10.55.57/api/~~
});


// ✅ 요청 인터셉터 설정 - 요청이 서버로 보내지기 전에 매번 실행됨
ApiClient.interceptors.request.use(
    (config) => {
        // 로컬 스토리지에서 accessToken 꺼내기 (JWT 토큰)
        const token = localStorage.getItem("accessToken");

        // 토큰이 있다면 요청 헤더에 Authorization 추가
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // 디버깅용 콘솔 (필요 시 주석 해제)
        // console.log(token);

        // 수정된 config 반환 (axios 내부로 전달됨)
        return config;
    },
    (error) => {
        // 요청 실패 시 에러를 그대로 반환
        return Promise.reject(error);
    }
);

export default ApiClient;