// src/components/SubmissionTracker.js
import React, { useState, useEffect } from "react";
// Import the Firestore instance (db), not DB.
import { db } from "./firebase";
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SubmissionTracker = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const submissionsQuery = query(collection(db, "submissions"));
    const unsubscribe = onSnapshot(submissionsQuery, (snapshot) => {
      const allSubmissions = [];
      snapshot.forEach((docSnap) => {
        allSubmissions.push({ id: docSnap.id, ...docSnap.data() });
      });
      setSubmissions(allSubmissions);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await updateDoc(doc(db, "submissions", id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating submission status: ", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-emerald-700 mb-6">
          Submission Tracker (Admin)
        </h1>

        {loading ? (
          <p className="text-emerald-700">Loading submissions...</p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full bg-white">
              <thead className="bg-emerald-600 text-white">
                <tr>
                  <th className="py-3 px-4 text-left" scope="col">
                    Title
                  </th>
                  <th className="py-3 px-4 text-left" scope="col">
                    User Email
                  </th>
                  <th className="py-3 px-4 text-left" scope="col">
                    Status
                  </th>
                  <th className="py-3 px-4 text-left" scope="col">
                    Submitted At
                  </th>
                  <th className="py-3 px-4 text-left" scope="col">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">{submission.title}</td>
                    <td className="py-3 px-4">
                      {submission.email || "-"}
                    </td>
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
                        ? new Date(
                            submission.submittedAt.seconds * 1000
                          ).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-2">
                        {submission.status !== "approved" && (
                          <button
                            onClick={() =>
                              handleStatusChange(submission.id, "approved")
                            }
                            disabled={updatingId === submission.id}
                            className={`px-3 py-1 text-xs rounded transition ${
                              updatingId === submission.id
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700 text-white"
                            }`}
                            aria-label={`Approve ${submission.title}`}
                          >
                            {updatingId === submission.id
                              ? "Updating..."
                              : "Approve"}
                          </button>
                        )}
                        {submission.status !== "rejected" && (
                          <button
                            onClick={() =>
                              handleStatusChange(submission.id, "rejected")
                            }
                            disabled={updatingId === submission.id}
                            className={`px-3 py-1 text-xs rounded transition ${
                              updatingId === submission.id
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700 text-white"
                            }`}
                            aria-label={`Reject ${submission.title}`}
                          >
                            {updatingId === submission.id
                              ? "Updating..."
                              : "Reject"}
                          </button>
                        )}
                        {submission.status !== "revision requested" && (
                          <button
                            onClick={() =>
                              handleStatusChange(
                                submission.id,
                                "revision requested"
                              )
                            }
                            disabled={updatingId === submission.id}
                            className={`px-3 py-1 text-xs rounded transition ${
                              updatingId === submission.id
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-yellow-600 hover:bg-yellow-700 text-white"
                            }`}
                            aria-label={`Request revision for ${submission.title}`}
                          >
                            {updatingId === submission.id
                              ? "Updating..."
                              : "Request Revision"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionTracker;
