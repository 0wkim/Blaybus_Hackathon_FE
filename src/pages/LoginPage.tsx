import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async () => {
        await login();
        navigate("/dashboard");
    };

    return (
        <>
            <h1>Login Page</h1>
            <button onClick={handleLogin}>로그인</button>
        </>
    )
}

export default LoginPage;