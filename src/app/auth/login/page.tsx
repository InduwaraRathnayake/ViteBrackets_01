/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Navbar from "@/app/components/Navbar";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({ username: "", password: "", auth: "" });
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);



  useEffect(() => {
    const activeUser = localStorage.getItem("active_user");

    if (activeUser) {
      const token = localStorage.getItem(`token_${activeUser}`);

      if (token) {
        try {
          const decodedToken: { exp: number } = jwtDecode(token);
          if (decodedToken.exp * 1000 < Date.now()) {
            // ✅ Expired token, clear session
            localStorage.removeItem(`token_${activeUser}`);
            localStorage.removeItem("active_user");
          } else {
            // ✅ If valid, redirect to dashboard
            router.push("/dashboard");
            return;
          }
        } catch (error) {
          console.error("Invalid token:", error);
          localStorage.removeItem(`token_${activeUser}`);
          localStorage.removeItem("active_user");
        }
      }
    }
    setIsCheckingAuth(false);
  }, [router]);

  if (isCheckingAuth) return ;

  // ✅ Real-time validation
  const validateField = (name: string, value: string) => {
    let error = "";

    if (name === "username" && value.length < 8) {
      error = "Username must be at least 8 characters long.";
    }

    if (name === "password" && value.length < 6) {
      error = "Password must be at least 6 characters long.";
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Validate as user types
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setErrors((prev) => ({ ...prev, auth: "" }));
    setLoading(true);
    

    // ✅ Final validation check before sending request
    if (!form.username || !form.password) {
      setErrors({
        ...errors,
        username: form.username ? "" : "Username is required.",
        password: form.password ? "" : "Password is required.",
      });
      setLoading(false);
      return;
    }

    if (errors.username || errors.password) {
      setLoading(false);
      return; // Stop submission if errors exist
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrors((prev) => ({ ...prev, auth: data.error || "Login failed." }));
      } else {
        // ✅ Store a separate session for each user
        localStorage.setItem(`token_${form.username}`, data.token);
        localStorage.setItem("active_user", form.username); // Track active user

        setSuccess("Login successful! Redirecting...");
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, auth: "An error occurred. Please try again." }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginpage relative w-full h-screen flex justify-center items-center bg-gray-950 text-white">
      <Navbar isSigned />
      <img className="absolute z-0 opacity-5 w-full h-full" src="/images/grid.png" alt=""/>
      <div className="absolute top-0 gradDot w-[400px] h-[400px] rounded-full bg-violet-600 blur-[150px] opacity-60 "></div>
      <div className="flex items-center justify-center w-3/5 h-full z-20">
        <div className="hidden xl:flex w-full p- ">
          <img className="object-center object-cover" src="/images/comp.png" alt="" />
        </div>
        <div className="w-full p-10 flex items-center justify-center z-10">
        <div
            className="w-[450px] h-[500px] bg-white/2 backdrop-blur-lg shadow-[0_5px_15px_rgba(0,0,0,0.35)] rounded-[10px] box-border py-[60px] px-[40px]"
          >
            {/* Title */}
            <p
              className="text-center mt-[10px] mb-[30px] text-[28px] font-extrabold"
              
            >
              Welcome back
            </p>

            {/* Form */}
            <form className="w-full flex flex-col gap-[18px] mb-[15px]" onSubmit={handleSubmit}>
            
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                type="text"
                placeholder="Username"
                className="rounded-[10px] border border-[#c0c0c0]/5 outline-none py-[12px] px-[15px]"
                required
              />
              {errors.username && <p style={{ color: "red", fontSize: "12px" }}>{errors.username}</p>}
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                type="password"
                placeholder="Password"
                className="rounded-[10px] border border-[#c0c0c0]/5 outline-none py-[12px] px-[15px]"
              />
              {errors.password && <p style={{ color: "red", fontSize: "12px" }}>{errors.password}</p>}
                
                {/* Authentication Error */}
              {errors.auth && <p style={{ color: "red" }}>{errors.auth}</p>}
              
              <p className="underline m-0 text-end text-purple-400 decoration-violet-500">
                <span
                  className="cursor-pointer text-[9px] font-bold hover:text-purple-300"
                >
                  Forgot Password?
                </span>
              </p>
              <button
            
                type="submit"
                className="py-[10px] px-[15px] rounded-[20px] outline-none bg-gradient-to-r from-indigo-300 to-purple-400 text-white cursor-pointer shadow-[0_3px_8px_rgba(0,0,0,0.24)] active:shadow-none hover:scale-97 transition duration-100 ease-in"
              >
                Log in
              </button>
            </form>

            {/* Sign-up Link */}
            <p
              className="m-0 text-[10px] text-[#747474]"
            >
              Don&apos;t have an account?
              <span
                onClick={() => router.push("/auth/signup")}
                className="ml-[1px] text-[11px] underline decoration-violet-500 text-purple-400 cursor-pointer font-extrabold"
              >
                Sign up
              </span>
            </p>

            {/* Success Message */}
            {success && <p style={{ color: "green" }}>{success}</p>}

      {/* Social Login Buttons */}
      
    </div>
        </div>
      </div>
      

      {/* Success Message */}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
}
