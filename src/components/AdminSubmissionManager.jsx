import React, { useState, useEffect, useCallback, useMemo } from "react";
import { db } from "./firebase";
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { FiEdit, FiLoader, FiX } from "react-icons/fi";
import "react-toastify/dist/ReactToastify.css";

const AdminSubmissionManager = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [formData, setFormData] = useState({ status: "", reviewComments: "" });
  const [updating, setUpdating] = useState(false);
  // Flag to ensure demo submission is added only once.
  const [demoAdded, setDemoAdded] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "submissions"));
    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const fetchedSubmissions = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            // Use submittedAt if available; otherwise use createdAt.
            submittedAt: data.submittedAt
              ? data.submittedAt.toDate()
              : data.createdAt
              ? data.createdAt.toDate()
              : null,
          };
        });

        setSubmissions(fetchedSubmissions);
        setLoading(false);

        // Add a demo submission if none exist (only once)
        if (fetchedSubmissions.length === 0 && !demoAdded) {
          try {
            const demoSubmissionRef = await addDoc(collection(db, "submissions"), {
              title: "Demo Submission",
              email: "demo@example.com",
              status: "pending",
              reviewComments: "",
              // This demo submission includes a sample file URL.
              fileUrl: "https://example.com/demo.pdf",
              createdAt: serverTimestamp(),
            });
            console.log("Demo submission added with ID:", demoSubmissionRef.id);
            setDemoAdded(true);
          } catch (error) {
            console.error("Error adding demo submission:", error);
            toast.error("Failed to add demo submission.");
          }
        }
      },
      (error) => {
        console.error("Error fetching submissions:", error);
        toast.error("Failed to fetch submissions.");
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [demoAdded]);

  const openEditModal = useCallback((submission) => {
    setSelectedSubmission(submission);
    setFormData({
      status: submission.status || "pending",
      reviewComments: submission.reviewComments || "",
    });
  }, []);

  const closeEditModal = () => setSelectedSubmission(null);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async () => {
    if (!selectedSubmission) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, "submissions", selectedSubmission.id), {
        ...formData,
        updatedAt: serverTimestamp(),
      });
      toast.success("Submission updated successfully.");
      closeEditModal();
    } catch (error) {
      console.error("Error updating submission:", error);
      toast.error("Failed to update submission.");
    } finally {
      setUpdating(false);
    }
  };

  // Renders the submissions table, including a "View PDF" link if fileUrl is provided.
  const renderedSubmissions = useMemo(
    () =>
      submissions.length > 0 ? (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white">
            <thead className="bg-emerald-600 text-white">
              <tr>
                {["Title", "User Email", "Status", "Submitted At", "PDF", "Actions"].map((header) => (
                  <th key={header} className="py-3 px-4 text-left">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {submissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">{submission.title}</td>
                  <td className="py-3 px-4">{submission.email || "-"}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        submission.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : submission.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : submission.status === "revision requested"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {submission.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {submission.submittedAt
                      ? submission.submittedAt.toLocaleDateString() +
                        " " +
                        submission.submittedAt.toLocaleTimeString()
                      : "-"}
                  </td>
                  <td className="py-3 px-4">
                    {submission.fileUrl ? (
                      <a
                        href={submission.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View PDF
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => openEditModal(submission)}
                      className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                      aria-label={`Edit ${submission.title}`}
                    >
                      <FiEdit className="inline-block mr-1" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-gray-700 text-xl">No submissions found.</p>
        </div>
      ),
    [submissions, openEditModal]
  );

  return (
    <div className="min-h-screen bg-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-emerald-700 mb-6">Admin Submission Manager</h1>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <FiLoader className="animate-spin text-emerald-600 text-4xl" />
            <p className="text-emerald-700 ml-4">Loading submissions...</p>
          </div>
        ) : (
          renderedSubmissions
        )}
      </div>

      {/* Edit Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative mx-4">
            <button
              onClick={closeEditModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
              aria-label="Close modal"
            >
              <FiX />
            </button>
            <h2 className="text-2xl font-bold text-emerald-700 mb-4">Update Submission</h2>
            <div className="mb-4">
              <label htmlFor="status" className="block text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-emerald-400"
              >
                {["pending", "approved", "rejected", "revision requested"].map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="reviewComments" className="block text-gray-700 mb-1">
                Review Comments (optional)
              </label>
              <textarea
                id="reviewComments"
                name="reviewComments"
                value={formData.reviewComments}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-emerald-400"
                rows="3"
                placeholder="Enter any review comments..."
              ></textarea>
            </div>
            <div className="text-right">
              <button
                onClick={handleUpdate}
                disabled={updating}
                className={`px-4 py-2 rounded transition text-white ${
                  updating ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {updating ? "Updating..." : "Update Submission"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubmissionManager;
