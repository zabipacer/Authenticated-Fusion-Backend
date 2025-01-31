import React, { useState, useEffect } from "react";
import { DB } from "./firebase";
import { ref, get, remove } from "firebase/database";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const [researchList, setResearchList] = useState([]);
  const navigate = useNavigate();

  // Truncate text utility function
  const truncateText = (text = "", limit) => {
    if (text.length > limit) {
      return `${text.substring(0, limit)}...`;
    }
    return text;
  };

  // Fetch all research from Firebase
  useEffect(() => {
    const fetchResearch = async () => {
      const researchRef = ref(DB, "research");
      const snapshot = await get(researchRef);
      const data = snapshot.val();

      if (data) {
        const researchArray = Object.keys(data).map((key) => ({
          ...data[key],
          researchId: key,
          abstract: truncateText(data[key].abstract, 100), // Truncate abstract here
        }));
        setResearchList(researchArray);
      }
    };

    fetchResearch();
  }, []);

  // Handle Edit
  const handleEdit = (researchId) => {
    console.log("Editing researchId:", researchId);
    navigate(`/edit-research/${researchId}`);
  };

  // Handle Delete
  const handleDelete = async (researchId) => {
    const researchRef = ref(DB, `research/${researchId}`);
    await remove(researchRef);
    setResearchList(researchList.filter((item) => item.researchId !== researchId));
  };

  // Handle Add New Research
  const handleAddNewResearch = () => {
    navigate("/add-research");
  };

  return (
    <div className="p-8 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 min-h-screen flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
        <h2 className="text-4xl font-extrabold text-emerald-800 mb-6 text-center">
          Research Dashboard
        </h2>

        <div className="mb-6 text-center">
          <button
            onClick={handleAddNewResearch}
            className="bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-emerald-600"
          >
            Add New Research
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-emerald-50">
              <tr>
                <th className="px-6 py-3">Research Title</th>
                <th className="px-6 py-3">Abstract</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {researchList.map((research) => (
                <tr
                  key={research.researchId}
                  className="border-b bg-emerald-50 hover:bg-emerald-100 transition-all duration-200"
                >
                  <td className="px-6 py-3">{research.title}</td>
                  <td className="px-6 py-3">{research.abstract}</td>
                  <td className="px-6 py-3 flex items-center space-x-4">
                    <button
                      onClick={() => handleEdit(research.researchId)}
                      className="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(research.researchId)}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
