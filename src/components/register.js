import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth, db } from "./firebase";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !fname || !lname) {
      toast.error("Please fill in all fields", {
        position: "bottom-center",
      });
      return;
    }

    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          firstName: fname,
          lastName: lname,
          photo: "",
        });
      }
      toast.success("User Registered Successfully!", {
        position: "top-center",
      });
    } catch (error) {
      console.log(error.message);
      const errorMessage = error.message.includes("email-already-in-use")
        ? "Email already in use. Please try another one."
        : error.message;
      toast.error(errorMessage, {
        position: "bottom-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-2xl font-semibold text-center mb-6">Sign Up</h3>

      <div className="mb-4">
        <label htmlFor="fname" className="block text-sm font-medium text-gray-700">First Name</label>
        <input
          type="text"
          id="fname"
          className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
          placeholder="First name"
          onChange={(e) => setFname(e.target.value)}
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="lname" className="block text-sm font-medium text-gray-700">Last Name</label>
        <input
          type="text"
          id="lname"
          className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
          placeholder="Last name"
          onChange={(e) => setLname(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
        <input
          type="email"
          id="email"
          className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
          placeholder="Enter email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="mb-6">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          id="password"
          className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
          placeholder="Enter password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="mb-6">
        <button
          type="submit"
          className={`w-full px-4 py-2 text-white font-semibold rounded-lg ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          disabled={loading}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </div>

      <p className="text-center text-sm text-gray-500">
        Already registered? <a href="/login" className="text-blue-600 hover:underline">Login</a>
      </p>
    </form>
  );
}

export default Register;
