import React, { useState, useEffect } from "react";
import { ref, get, set, push } from "firebase/database";
import { DB } from "./firebase";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiTrash2,
  FiPlusCircle,
  FiLoader,
} from "react-icons/fi";

const DynamicTopicsForm = () => {
  // Rename URL param for clarity
  const { Id: researchId } = useParams();
  console.log("Research ID:", researchId);

  // ----------------------
  // State declarations
  // ----------------------
  const [researchTitle, setResearchTitle] = useState("");
  const [researchAbstract, setResearchAbstract] = useState("");
  const [researchCategory, setResearchCategory] = useState("");
  const [mainImage, setMainImage] = useState(null);
  const [researchPDF, setResearchPDF] = useState(null);
  const [topics, setTopics] = useState([
    {
      title: "",
      description: "",
      image: null,
      subtopics: [
        {
          subtopicTitle: "",
          subtopicDescription: "",
          subtopicImage: null,
        },
      ],
    },
  ]);
  // New state for submission loading
  const [submitting, setSubmitting] = useState(false);

  // ----------------------
  // Fetch Research Data (if editing)
  // ----------------------
  useEffect(() => {
    if (researchId) {
      const fetchData = async () => {
        try {
          const researchRef = ref(DB, `research/${researchId}`);
          const snapshot = await get(researchRef);
          if (snapshot.exists()) {
            const data = snapshot.val();
            setResearchTitle(data.title || "");
            setResearchAbstract(data.abstract || "");
            setTopics(data.topics || []);
            setMainImage(data.mainImage || null);
            setResearchCategory(data.category || "");
            // Preserve PDF URL if it already exists
            if (data.pdf) {
              setResearchPDF(data.pdf);
            }
          }
        } catch (error) {
          console.error("Error fetching research data:", error);
          toast.error(
            <span>
              <FiAlertCircle className="inline mr-1" /> Failed to fetch research data.
            </span>
          );
        }
      };
      fetchData();
    }
  }, [researchId]);

  // ----------------------
  // File Handlers
  // ----------------------
  const handlePDFChange = (e) => {
    const file = e.target.files[0];
    setResearchPDF(file);
  };

  const handleImageChange = (e, topicIndex, field) => {
    const file = e.target.files[0];
    if (topicIndex === "mainImage") {
      setMainImage(file);
    } else {
      setTopics((prevTopics) => {
        const updated = [...prevTopics];
        updated[topicIndex] = { ...updated[topicIndex], [field]: file };
        return updated;
      });
    }
  };

  const handleSubtopicImageChange = (e, topicIndex, subtopicIndex, field) => {
    const file = e.target.files[0];
    setTopics((prevTopics) => {
      const updated = [...prevTopics];
      const topic = { ...updated[topicIndex] };
      const subtopics = [...topic.subtopics];
      subtopics[subtopicIndex] = { ...subtopics[subtopicIndex], [field]: file };
      topic.subtopics = subtopics;
      updated[topicIndex] = topic;
      return updated;
    });
  };

  // ----------------------
  // Text & Input Handlers
  // ----------------------
  const handleInputChange = (e, field) => {
    if (field === "title") setResearchTitle(e.target.value);
    else if (field === "abstract") setResearchAbstract(e.target.value);
  };

  const handleTopicChange = (e, topicIndex, field) => {
    setTopics((prevTopics) => {
      const updated = [...prevTopics];
      updated[topicIndex] = { ...updated[topicIndex], [field]: e.target.value };
      return updated;
    });
  };

  const handleSubtopicChange = (e, topicIndex, subtopicIndex, field) => {
    setTopics((prevTopics) => {
      const updated = [...prevTopics];
      const topic = { ...updated[topicIndex] };
      const subtopics = [...topic.subtopics];
      subtopics[subtopicIndex] = { ...subtopics[subtopicIndex], [field]: e.target.value };
      topic.subtopics = subtopics;
      updated[topicIndex] = topic;
      return updated;
    });
  };

  // ----------------------
  // Topics and Subtopics Handlers
  // ----------------------
  const addTopic = () => {
    setTopics((prev) => [
      ...prev,
      {
        title: "",
        description: "",
        image: null,
        subtopics: [
          {
            subtopicTitle: "",
            subtopicDescription: "",
            subtopicImage: null,
          },
        ],
      },
    ]);
  };

  const removeTopic = (index) => {
    setTopics((prev) => prev.filter((_, i) => i !== index));
    toast.info(
      <span>
        <FiAlertCircle className="inline mr-1" /> Topic removed.
      </span>
    );
  };

  const addSubtopic = (topicIndex) => {
    setTopics((prevTopics) => {
      const updated = [...prevTopics];
      const topic = { ...updated[topicIndex] };
      topic.subtopics = [
        ...topic.subtopics,
        { subtopicTitle: "", subtopicDescription: "", subtopicImage: null },
      ];
      updated[topicIndex] = topic;
      return updated;
    });
  };

  const removeSubtopic = (topicIndex, subtopicIndex) => {
    setTopics((prevTopics) => {
      const updated = [...prevTopics];
      const topic = { ...updated[topicIndex] };
      topic.subtopics = topic.subtopics.filter((_, i) => i !== subtopicIndex);
      updated[topicIndex] = topic;
      return updated;
    });
    toast.info(
      <span>
        <FiAlertCircle className="inline mr-1" /> Subtopic removed.
      </span>
    );
  };

  // ----------------------
  // Upload Functions
  // ----------------------
  // Upload an image file to ImgBB and return its URL.
  const uploadImageToImgBB = async (imageFile) => {
    if (!imageFile) return null;
    const formData = new FormData();
    formData.append("key", "1a556dc4fe6518bef395ddf23fd7b1af"); // Your ImgBB API key
    formData.append("image", imageFile);

    try {
      const response = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        return result.data.url;
      } else {
        throw new Error("ImgBB upload failed.");
      }
    } catch (error) {
      console.error("Error uploading image to ImgBB:", error);
      toast.error(
        <span>
          <FiAlertCircle className="inline mr-1" /> Error uploading image.
        </span>
      );
      throw error;
    }
  };

  // Upload a PDF file to Firebase Storage and return its URL.
  const uploadPDFToStorage = async (pdfFile) => {
    if (!pdfFile) return null;
    const storage = getStorage();
    const pdfReference = storageRef(storage, `researchPDFs/${pdfFile.name}-${Date.now()}`);
    try {
      await uploadBytes(pdfReference, pdfFile);
      return await getDownloadURL(pdfReference);
    } catch (error) {
      console.error("Error uploading PDF:", error);
      toast.error(
        <span>
          <FiAlertCircle className="inline mr-1" /> Error uploading PDF.
        </span>
      );
      throw error;
    }
  };

  // ----------------------
  // Form Submission Handler
  // ----------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Upload main image if a new file is provided.
      const mainImageURL =
        mainImage instanceof File ? await uploadImageToImgBB(mainImage) : (mainImage ?? null);

      // Upload PDF if provided.
      const researchPDFURL =
        researchPDF instanceof File ? await uploadPDFToStorage(researchPDF) : (researchPDF ?? null);

      // Process topics and subtopics concurrently.
      const formattedTopics = await Promise.all(
        topics.map(async (topic) => {
          const topicImageURL =
            topic.image instanceof File ? await uploadImageToImgBB(topic.image) : (topic.image ?? null);

          const subtopics = await Promise.all(
            topic.subtopics.map(async (subtopic) => {
              const subtopicImageURL =
                subtopic.subtopicImage instanceof File
                  ? await uploadImageToImgBB(subtopic.subtopicImage)
                  : (subtopic.subtopicImage ?? null);
              return {
                ...subtopic,
                subtopicImage: subtopicImageURL,
              };
            })
          );

          return {
            ...topic,
            image: topicImageURL,
            subtopics,
          };
        })
      );

      const formattedData = {
        title: researchTitle,
        abstract: researchAbstract,
        category: researchCategory,
        mainImage: mainImageURL,
        pdf: researchPDFURL,
        topics: formattedTopics,
      };

      // Update existing research if researchId exists; otherwise, create new.
      if (researchId) {
        const researchRef = ref(DB, `research/${researchId}`);
        await set(researchRef, formattedData);
        toast.success(
          <span>
            <FiCheckCircle className="inline mr-1" /> Research updated successfully!
          </span>
        );
      } else {
        const newResearchRef = ref(DB, "research");
        const newResearchKey = push(newResearchRef).key;
        const newResearchPath = ref(DB, `research/${newResearchKey}`);
        await set(newResearchPath, formattedData);
        toast.success(
          <span>
            <FiCheckCircle className="inline mr-1" /> New research created successfully!
          </span>
        );
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error(
        <span>
          <FiAlertCircle className="inline mr-1" /> Failed to submit data. Please try again.
        </span>
      );
      // Rethrow the error so that it is not silently swallowed.
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------
  // Render Component
  // ----------------------
  return (
    <div className="p-8 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 min-h-screen flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
        <h1 className="text-4xl font-extrabold text-emerald-800 mb-6 text-center">
          {researchId ? `Edit Research - ${researchTitle}` : "Create New Research"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Research Title */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-emerald-700 mb-2">
              Research Title
            </label>
            <input
              type="text"
              className="w-full p-2 rounded-lg border-2 border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={researchTitle}
              onChange={(e) => handleInputChange(e, "title")}
              placeholder="Enter research title"
            />
          </div>

          {/* Research Abstract */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-emerald-700 mb-2">
              Abstract
            </label>
            <textarea
              className="w-full p-2 rounded-lg border-2 border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={researchAbstract}
              onChange={(e) => handleInputChange(e, "abstract")}
              placeholder="Enter research abstract"
            />
          </div>

          {/* Research Category */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-emerald-700 mb-2">
              Category
            </label>
            <select
              className="w-full p-2 rounded-lg border-2 border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={researchCategory}
              onChange={(e) => setResearchCategory(e.target.value)}
            >
              <option value="" disabled>
                Select a category
              </option>
              <option value="Engineering">Engineering</option>
              <option value="Medical Sciences">Medical Sciences</option>
              <option value="Earth Sciences">Earth Sciences</option>
              <option value="Social Sciences">Social Sciences</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {/* Research PDF */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-emerald-700 mb-2">
              Research PDF
            </label>
            <input
              type="file"
              accept="application/pdf"
              className="w-full p-2 rounded-lg border-2 border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              onChange={handlePDFChange}
            />
            {researchPDF && researchPDF instanceof File && (
              <p className="mt-2 text-sm text-gray-600">Selected file: {researchPDF.name}</p>
            )}
            {researchPDF && typeof researchPDF === "string" && (
              <a
                href={researchPDF}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm text-blue-600 underline"
              >
                View Uploaded PDF
              </a>
            )}
          </div>

          {/* Main Image */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-emerald-700 mb-2">
              Main Image
            </label>
            <input
              type="file"
              className="w-full p-2 rounded-lg border-2 border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              onChange={(e) => handleImageChange(e, "mainImage")}
            />
            {/* Main Image Preview */}
            {mainImage && typeof mainImage === "string" && (
              <img
                src={mainImage}
                alt="Current Main"
                className="w-32 h-32 object-cover mt-2"
              />
            )}
            {mainImage && mainImage instanceof File && (
              <img
                src={URL.createObjectURL(mainImage)}
                alt="New Main Preview"
                className="w-32 h-32 object-cover mt-2"
              />
            )}
          </div>

          {/* Topics Section */}
          {topics.map((topic, topicIndex) => (
            <div
              key={topicIndex}
              className="bg-emerald-50 p-6 rounded-lg shadow-md mb-6 border-t-4 border-emerald-500"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-emerald-700">
                  Topic {topicIndex + 1}
                </h3>
                <button
                  type="button"
                  onClick={() => removeTopic(topicIndex)}
                  className="flex items-center text-red-500 hover:text-red-700 font-medium"
                >
                  <FiTrash2 className="mr-1" /> Remove Topic
                </button>
              </div>

              {/* Topic Title */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-emerald-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  className="w-full p-2 rounded-lg border-2 border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={topic.title}
                  onChange={(e) => handleTopicChange(e, topicIndex, "title")}
                  placeholder="Enter topic title"
                />
              </div>

              {/* Topic Description */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-emerald-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full p-2 rounded-lg border-2 border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={topic.description}
                  onChange={(e) => handleTopicChange(e, topicIndex, "description")}
                  placeholder="Enter topic description"
                />
              </div>

              {/* Topic Image */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-emerald-700 mb-2">
                  Upload Image
                </label>
                <input
                  type="file"
                  className="w-full p-2 rounded-lg border-2 border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  onChange={(e) => handleImageChange(e, topicIndex, "image")}
                />
                {topic.image && typeof topic.image === "string" && (
                  <img
                    src={topic.image}
                    alt={`Topic ${topicIndex} Preview`}
                    className="w-32 h-32 object-cover mt-2"
                  />
                )}
                {topic.image && topic.image instanceof File && (
                  <img
                    src={URL.createObjectURL(topic.image)}
                    alt={`Topic ${topicIndex} New Preview`}
                    className="w-32 h-32 object-cover mt-2"
                  />
                )}
              </div>

              {/* Subtopics Section */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-emerald-700">Subtopics</h4>
                {topic.subtopics.map((subtopic, subtopicIndex) => (
                  <div
                    key={subtopicIndex}
                    className="bg-emerald-100 p-4 mb-4 rounded-lg shadow-sm border border-emerald-200"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="text-md font-semibold text-emerald-600">
                        Subtopic {subtopicIndex + 1}
                      </h5>
                      <button
                        type="button"
                        onClick={() => removeSubtopic(topicIndex, subtopicIndex)}
                        className="flex items-center text-red-500 font-medium hover:text-red-700"
                      >
                        <FiTrash2 className="mr-1" /> Remove Subtopic
                      </button>
                    </div>

                    {/* Subtopic Title */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-emerald-700 mb-2">
                        Subtopic Title
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 rounded-lg border-2 border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        value={subtopic.subtopicTitle}
                        onChange={(e) =>
                          handleSubtopicChange(e, topicIndex, subtopicIndex, "subtopicTitle")
                        }
                        placeholder="Enter subtopic title"
                      />
                    </div>

                    {/* Subtopic Description */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-emerald-700 mb-2">
                        Subtopic Description
                      </label>
                      <textarea
                        className="w-full p-2 rounded-lg border-2 border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        value={subtopic.subtopicDescription}
                        onChange={(e) =>
                          handleSubtopicChange(e, topicIndex, subtopicIndex, "subtopicDescription")
                        }
                        placeholder="Enter subtopic description"
                      />
                    </div>

                    {/* Subtopic Image */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-emerald-700 mb-2">
                        Subtopic Image
                      </label>
                      <input
                        type="file"
                        className="w-full p-2 rounded-lg border-2 border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        onChange={(e) =>
                          handleSubtopicImageChange(e, topicIndex, subtopicIndex, "subtopicImage")
                        }
                      />
                      {subtopic.subtopicImage && typeof subtopic.subtopicImage === "string" && (
                        <img
                          src={subtopic.subtopicImage}
                          alt={`Subtopic ${subtopicIndex} Preview`}
                          className="w-32 h-32 object-cover mt-2"
                        />
                      )}
                      {subtopic.subtopicImage && subtopic.subtopicImage instanceof File && (
                        <img
                          src={URL.createObjectURL(subtopic.subtopicImage)}
                          alt={`Subtopic ${subtopicIndex} New Preview`}
                          className="w-32 h-32 object-cover mt-2"
                        />
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addSubtopic(topicIndex)}
                  className="flex items-center text-emerald-700 hover:text-emerald-900 font-medium"
                >
                  <FiPlusCircle className="mr-1" /> Add Subtopic
                </button>
              </div>
            </div>
          ))}

          {/* Add New Topic Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={addTopic}
              className="flex items-center p-2 bg-emerald-500 text-white rounded hover:bg-emerald-600"
            >
              <FiPlusCircle className="mr-1" /> Add New Topic
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full p-4 bg-emerald-700 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {submitting ? (
              <>
                <FiLoader className="animate-spin mr-2" /> Submitting...
              </>
            ) : researchId ? (
              "Update Research"
            ) : (
              "Create Research"
            )}
          </button>
        </form>
      </div>
      {/* Toast Container for notifications */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default DynamicTopicsForm;
