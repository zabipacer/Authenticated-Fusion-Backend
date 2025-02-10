import { ref, get, set, push } from "firebase/database";
import React, { useState, useEffect } from "react";
import { DB } from "./firebase";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useParams } from "react-router-dom";

const DynamicTopicsForm = () => {
  const { Id } = useParams(); // Fetch the researchId from the URL params
  console.log(Id)
  const [researchTitle, setResearchTitle] = useState("");
  const [researchAbstract, setResearchAbstract] = useState("");
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
  const [researchCategory, setResearchCategory] = useState("");
  const [mainImage, setMainImage] = useState(null);
      
  useEffect(() => {
    if (Id) {
      const fetchData = async () => {
        const researchRef = ref(DB, `research/${Id}`);
        const snapshot = await get(researchRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setResearchTitle(data.title);
          setResearchAbstract(data.abstract);
          setTopics(data.topics || []);
          setMainImage(data.mainImage || null); // Initialize main image
          setResearchCategory(data.category || "");
        }
      };
      fetchData();
    }
  }, [Id]);

  // Add new topic
  const addTopic = () => {
    setTopics([...topics, {
      title: "",
      description: "",
      image: null,
      subtopics: [{
        subtopicTitle: "",
        subtopicDescription: "",
        subtopicImage: null,
      }]
    }]);
  };

  const handleInputChange = (e, field) => {
    if (field === "title") setResearchTitle(e.target.value);
    else if (field === "abstract") setResearchAbstract(e.target.value);
  };

  const handleTopicChange = (e, topicIndex, field) => {
    const updatedTopics = [...topics];
    updatedTopics[topicIndex][field] = e.target.value;
    setTopics(updatedTopics);
  };

  const handleSubtopicChange = (e, topicIndex, subtopicIndex, field) => {
    const updatedTopics = [...topics];
    updatedTopics[topicIndex].subtopics[subtopicIndex][field] = e.target.value;
    setTopics(updatedTopics);
  };

  const handleImageChange = (e, topicIndex, field) => {
    const file = e.target.files[0];
    if (topicIndex === 'mainImage') {
      setMainImage(file); // Set the main image
    } else {
      const updatedTopics = [...topics];
      updatedTopics[topicIndex][field] = file;
      setTopics(updatedTopics);
    }
  };
  
  const handleSubtopicImageChange = (e, topicIndex, subtopicIndex, field) => {
    const updatedTopics = [...topics];
    updatedTopics[topicIndex].subtopics[subtopicIndex][field] = e.target.files[0];
    setTopics(updatedTopics);
  };

  // Added: Modified upload function to check for null before uploading.
  const uploadImageToImgBB = async (imageFile) => {
    if (!imageFile) return null; // If no file is provided, return null.
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
        return result.data.url; // Return the uploaded image URL
      } else {
        throw new Error("ImgBB upload failed.");
      }
    } catch (error) {
      console.error("Error uploading image to ImgBB:", error);
      throw error;
    }
  };

  const removeTopic = (index) => {
    const updatedTopics = topics.filter((_, i) => i !== index);
    setTopics(updatedTopics);
  };

  const addSubtopic = (topicIndex) => {
    const updatedTopics = [...topics];
    updatedTopics[topicIndex].subtopics.push({
      subtopicTitle: "",
      subtopicDescription: "",
      subtopicImage: null,
    });
    setTopics(updatedTopics);
  };

  const removeSubtopic = (topicIndex, subtopicIndex) => {
    const updatedTopics = [...topics];
    updatedTopics[topicIndex].subtopics = updatedTopics[topicIndex].subtopics.filter(
      (_, i) => i !== subtopicIndex
    );
    setTopics(updatedTopics);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // Handle main image (if new file, upload; otherwise, use the saved URL)
      const mainImageURL = mainImage instanceof File 
        ? await uploadImageToImgBB(mainImage)
        : mainImage;
  
      const formattedTopics = await Promise.all(
        topics.map(async (topic) => {
          // Handle topic image
          const topicImageURL = topic.image instanceof File 
            ? await uploadImageToImgBB(topic.image)
            : topic.image;
  
          const subtopics = await Promise.all(
            topic.subtopics.map(async (subtopic) => {
              // Handle subtopic image
              const subtopicImageURL = subtopic.subtopicImage instanceof File
                ? await uploadImageToImgBB(subtopic.subtopicImage)
                : subtopic.subtopicImage;
  
              return {
                ...subtopic,
                subtopicImage: subtopicImageURL
              };
            })
          );
  
          return {
            ...topic,
            image: topicImageURL,
            subtopics
          };
        })
      );
  
      const formattedData = {
        title: researchTitle,
        abstract: researchAbstract,
        category: researchCategory,
        mainImage: mainImageURL,
        topics: formattedTopics
      };
  
      if (Id) {
        const researchRef = ref(DB, `research/${Id}`);
        await set(researchRef, formattedData);
        alert("Research updated successfully!");
      } else {
        const newResearchRef = ref(DB, 'research');
        const newResearchKey = push(newResearchRef).key;
        const newResearchPath = ref(DB, `research/${newResearchKey}`);
        await set(newResearchPath, formattedData);
        alert("New research created successfully!");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("Failed to submit data. Please try again.");
    }
  };
  
  return (
    <div className="p-8 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 min-h-screen flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
        <h1 className="text-4xl font-extrabold text-emerald-800 mb-6 text-center">
          {Id ?` Edit Research - ${researchTitle}` : 'Create New Research'}
        </h1>
  
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-emerald-700 mb-2">Research Title</label>
            <input
              type="text"
              className="w-full p-2 rounded-lg border-2 border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={researchTitle}
              onChange={(e) => handleInputChange(e, "title")}
              placeholder="Enter research title"
            />
          </div>
  
          <div className="mb-4">
            <label className="block text-sm font-semibold text-emerald-700 mb-2">Abstract</label>
            <textarea
              className="w-full p-2 rounded-lg border-2 border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={researchAbstract}
              onChange={(e) => handleInputChange(e, "abstract")}
              placeholder="Enter research abstract"
            />
          </div>
  
          <div className="mb-4">
            <label className="block text-sm font-semibold text-emerald-700 mb-2">Category</label>
            <select
              className="w-full p-2 rounded-lg border-2 border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={researchCategory}
              onChange={(e) => setResearchCategory(e.target.value)}
            >
              <option value="" disabled>Select a category</option>
              <option value="Engineering">Engineering</option>
              <option value="Medical Sciences">Medical Sciences</option>
              <option value="Earth Sciences">Earth Sciences</option>
              <option value="Social Sciences">Social Sciences</option>
              <option value="Others">Others</option>
            </select>
          </div>
  
          <div className="mb-4">
            <label className="block text-sm font-semibold text-emerald-700 mb-2">Main Image</label>
            <input
              type="file"
              className="w-full p-2 rounded-lg border-2 border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              onChange={(e) => handleImageChange(e, 'mainImage')}
            />
            {/* Added: Main image preview */}
            {mainImage && typeof mainImage === 'string' && (
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
  
          {topics.map((topic, topicIndex) => (
            <div key={topicIndex} className="bg-emerald-50 p-6 rounded-lg shadow-md mb-6 border-t-4 border-emerald-500">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-emerald-700">Topic {topicIndex + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeTopic(topicIndex)}
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  Remove Topic
                </button>
              </div>
  
              <div className="mb-4">
                <label className="block text-sm font-semibold text-emerald-700 mb-2">Title</label>
                <input
                  type="text"
                  className="w-full p-2 rounded-lg border-2 border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={topic.title}
                  onChange={(e) => handleTopicChange(e, topicIndex, "title")}
                  placeholder="Enter topic title"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-emerald-700 mb-2">Description</label>
                <textarea
                  className="w-full p-2 rounded-lg border-2 border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={topic.description}
                  onChange={(e) => handleTopicChange(e, topicIndex, "description")}
                  placeholder="Enter topic description"
                />
              </div>
  
              <div className="mb-4">
                <label className="block text-sm font-semibold text-emerald-700 mb-2">Upload Image</label>
                <input
                  type="file"
                  className="w-full p-2 rounded-lg border-2 border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  onChange={(e) => handleImageChange(e, topicIndex, "image")}
                />
                {/* Added: Topic image preview */}
                {topic.image && typeof topic.image === 'string' && (
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
  
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-emerald-700">Subtopics</h4>
                {topic.subtopics.map((subtopic, subtopicIndex) => (
                  <div key={subtopicIndex} className="bg-emerald-100 p-4 mb-4 rounded-lg shadow-sm border-emerald-200">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="text-md font-semibold text-emerald-600">Subtopic {subtopicIndex + 1}</h5>
                      <button
                        type="button"
                        onClick={() => removeSubtopic(topicIndex, subtopicIndex)}
                        className="text-red-500 font-medium hover:text-red-700"
                      >
                        Remove Subtopic
                      </button>
                    </div>
  
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-emerald-700 mb-2">Subtopic Title</label>
                      <input
                        type="text"
                        className="w-full p-2 rounded-lg border-2 border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        value={subtopic.subtopicTitle}
                        onChange={(e) => handleSubtopicChange(e, topicIndex, subtopicIndex, "subtopicTitle")}
                        placeholder="Enter subtopic title"
                      />
                    </div>
  
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-emerald-700 mb-2">Subtopic Description</label>
                      <textarea
                        className="w-full p-2 rounded-lg border-2 border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        value={subtopic.subtopicDescription}
                        onChange={(e) => handleSubtopicChange(e, topicIndex, subtopicIndex, "subtopicDescription")}
                        placeholder="Enter subtopic description"
                      />
                    </div>
  
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-emerald-700 mb-2">Subtopic Image</label>
                      <input
                        type="file"
                        className="w-full p-2 rounded-lg border-2 border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        onChange={(e) => handleSubtopicImageChange(e, topicIndex, subtopicIndex, "subtopicImage")}
                      />
                      {/* Added: Subtopic image preview */}
                      {subtopic.subtopicImage && typeof subtopic.subtopicImage === 'string' && (
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
                  className="text-emerald-700 hover:text-emerald-900 font-medium"
                >
                  Add Subtopic
                </button>
              </div>
            </div>
          ))}
          <div className="mb-6">
            <button
              type="button"
              onClick={addTopic}
              className="p-2 bg-emerald-500 text-white rounded hover:bg-emerald-600"
            >
              Add New Topic
            </button>
          </div>
          <button
            type="submit"
            className="w-full p-4 bg-emerald-700 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-600"
          >
            {Id ? 'Update Research' : 'Create Research'}
          </button>
        </form>
      </div>
    </div>
  );
};
  
export default DynamicTopicsForm;
