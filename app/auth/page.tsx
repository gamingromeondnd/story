import Login from "@/src/components/Login";

export default function AuthPage() {
    return (
        <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-12 sm:px-6">
            <Login standalone />
        </main>
    );
}
