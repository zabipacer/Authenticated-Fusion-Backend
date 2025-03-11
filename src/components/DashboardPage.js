import React, { useState, useEffect } from "react";
import { DB } from "./firebase";
import { ref, get, remove } from "firebase/database";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const [researchList, setResearchList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Utility function: truncate text to a given limit
  const truncateText = (text = "", limit = 100) =>
    text?.length > limit ? `${text.substring(0, limit)}...` : text;

  // Fetch all research from Firebase
  useEffect(() => {
    let isMounted = true;
    
    const fetchResearch = async () => {
      try {
        const researchRef = ref(DB, "research");
        const snapshot = await get(researchRef);
        const data = snapshot.val();

        if (data && isMounted) {
          setResearchList(
            Object.keys(data).map((key) => ({
              ...data[key],
              researchId: key,
              abstract: truncateText(data[key].abstract, 100),
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching research data:", error);
      }
    };

    fetchResearch();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter research based on search term (by title)
  const filteredResearch = researchList.filter((item) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Limit display to 6 items
  const displayedResearch = filteredResearch.slice(0, 6);

  // Handle Edit
  const handleEdit = (researchId) => {
    navigate(`/edit-research/${researchId}`);
  };

  // Handle Delete
  const handleDelete = async (researchId) => {
    try {
      await remove(ref(DB, `research/${researchId}`));
      setResearchList((prev) =>
        prev.filter((item) => item.researchId !== researchId)
      );
    } catch (error) {
      console.error("Error deleting research:", error);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 min-h-screen flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-6xl transform transition-all duration-300 hover:shadow-3xl">
        <h2 className="text-5xl font-extrabold text-emerald-800 mb-8 text-center">
          Research Dashboard
        </h2>

        {/* Controls: Add New Research & Search */}
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <button
            onClick={() => navigate("/add-research")}
            className="bg-emerald-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-emerald-600 transition-all duration-200 transform hover:scale-105 mb-4 sm:mb-0"
          >
            Add New Research
          </button>
          <div className="relative w-full sm:w-1/3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title..."
              aria-label="Search research by title"
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <svg
              className="w-5 h-5 absolute right-3 top-3 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
          </div>
        </div>

        {/* Research Table */}
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full text-sm text-left text-gray-800">
            <thead className="text-xs text-gray-700 uppercase bg-emerald-50">
              <tr>
                <th className="px-8 py-4">Research Title</th>
                <th className="px-8 py-4">Abstract</th>
                <th className="px-8 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedResearch.length > 0 ? (
                displayedResearch.map(({ researchId, title, abstract }) => (
                  <tr
                    key={researchId}
                    className="border-b bg-emerald-50 hover:bg-emerald-100 transition-all duration-200"
                  >
                    <td className="px-8 py-4 font-medium text-gray-900">{title}</td>
                    <td className="px-8 py-4">{abstract}</td>
                    <td className="px-8 py-4 flex items-center space-x-6">
                      <button
                        onClick={() => handleEdit(researchId)}
                        className="text-emerald-600 hover:text-emerald-700 font-medium transition-all duration-200 transform hover:scale-105"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(researchId)}
                        className="text-red-500 hover:text-red-700 font-medium transition-all duration-200 transform hover:scale-105"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-8 py-4 text-center text-gray-500">
                    No research available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
