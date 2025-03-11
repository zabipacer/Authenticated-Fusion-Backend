import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { motion } from "framer-motion";

const Profile = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("You have been logged out successfully.");
      navigate("/");
    } catch (error) {
      alert("Error logging out. Please try again.");
    }
  };

  if (!auth.currentUser) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 flex flex-col items-center justify-center p-6 md:p-12">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Welcome, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{auth.currentUser.email}</span>!
        </h1>
        <p className="text-gray-600 text-lg">Explore and manage your platform with ease.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <div className="flex flex-col items-center text-center">
            <MdDashboard className="text-4xl text-blue-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Dashboard</h2>
            <p className="text-gray-600">Access your personalized dashboard for insights and analytics.</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
          onClick={() => navigate("/admin-submission-manager")}
        >
          <div className="flex flex-col items-center text-center">
            <FaUser className="text-4xl text-green-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Admin Submission Manager</h2>
            <p className="text-gray-600">Manage and review all submissions efficiently.</p>
          </div>
        </motion.div>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleLogout}
        className="mt-10 flex items-center space-x-3 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-all duration-200"
      >
        <FaSignOutAlt className="text-lg" />
        <span>Logout</span>
      </motion.button>
    </div>
  );
};

export default Profile;
