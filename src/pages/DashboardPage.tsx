import { useAuth } from "../providers/AuthProvider";

function DashboardPage() {
    const { logout } = useAuth();

    return (
        <>
            <h1>Dashboard Page</h1>
            <button onClick={logout}>로그아웃</button>
        </>
    )
}

export default DashboardPage;