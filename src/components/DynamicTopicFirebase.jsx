import { ref, get, set } from "firebase/database";
import React, { useState, useEffect } from "react";
import { DB } from "./firebase";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useParams } from "react-router-dom";

const DynamicTopicsForm = () => {
  const { researchId } = useParams(); // Fetch the researchId from the URL params
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

  useEffect(() => {
    if (researchId) {
      // Fetch existing research data when researchId is available
      const fetchData = async () => {
        const researchRef = ref(DB, `research/${researchId}`);
        const snapshot = await get(researchRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setResearchTitle(data.title);
          setResearchAbstract(data.abstract);
          setTopics(data.topics || []);
        } else {
          alert("Research not found.");
        }
      };
      fetchData();
    }
  }, [researchId]);

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
    const updatedTopics = [...topics];
    updatedTopics[topicIndex][field] = e.target.files[0];
    setTopics(updatedTopics);
  };

  const handleSubtopicImageChange = (e, topicIndex, subtopicIndex, field) => {
    const updatedTopics = [...topics];
    updatedTopics[topicIndex].subtopics[subtopicIndex][field] = e.target.files[0];
    setTopics(updatedTopics);
  };

  const uploadImageToStorage = async (imageFile, folder) => {
    const storage = getStorage();
    const imageRef = storageRef(storage, `${folder}/${imageFile.name}`);
    await uploadBytes(imageRef, imageFile);
    return getDownloadURL(imageRef);
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
      const formattedTopics = await Promise.all(
        topics.map(async (topic) => {
          const topicImageURL = topic.image
            ? await uploadImageToStorage(topic.image, `topics/${researchId}`)
            : null;

          const subtopics = await Promise.all(
            topic.subtopics.map(async (subtopic) => {
              const subtopicImageURL = subtopic.subtopicImage
                ? await uploadImageToStorage(subtopic.subtopicImage, `subtopics/${researchId}`)
                : null;
              return {
                subtopicTitle: subtopic.subtopicTitle,
                subtopicDescription: subtopic.subtopicDescription,
                subtopicImage: subtopicImageURL,
              };
            })
          );

          return {
            title: topic.title,
            description: topic.description,
            image: topicImageURL,
            subtopics,
          };
        })
      );

      const formattedData = {
        researchId,
        title: researchTitle,
        abstract: researchAbstract,
        topics: formattedTopics,
      };

      const researchRef = ref(DB, `research/${researchId}`);
      await set(researchRef, formattedData);

      console.log("Submitted Data:", formattedData);
      alert("Data updated successfully!");
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Failed to submit data. Please try again.");
    }
  };

  return (
    <div className="p-8 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 min-h-screen flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
      <h1 className="text-4xl font-extrabold text-emerald-800 mb-6 text-center">
  {researchId ? `Edit Research - ${researchTitle}` : 'Create New Research'}
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

<button
  type="submit"
  className="w-full p-4 bg-emerald-700 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-600"
>
  {researchId ? 'Update Research' : 'Create Research'}
</button>
        </form>
      </div>
    </div>
  );
};

export default DynamicTopicsForm;
