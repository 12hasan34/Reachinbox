import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../api/auth.api";
import { useAuth } from "../auth/AuthContext";
import Button from "../components/Button";
import Input from "../components/Input";

export default function Login() {
  const [email, setEmail] = useState("hasanadmin@mail.com");
  const [password, setPassword] = useState("hasan");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // TEMP MOCK RESPONSE if backend not ready
      // const res = { data: { token: "fake-token", user: { email } } };

      const res = await loginApi(email, password);
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-1 text-sm font-semibold text-gray-900">ReachInbox</div>
          <h1 className="mb-4 text-xl font-semibold text-gray-900">Login</h1>

          {error ? (
            <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="space-y-3">
            <Input
              label="Email"
              placeholder="hasanadmin@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              placeholder="hasan"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button type="submit" loading={loading} className="w-full">
              Login
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}