import React, { useState } from "react";

const Dashboard = () => {
  const [research, setResearch] = useState({
    title: "",
    abstract: "",
    rightsAndPermissions: "",
    authors: "",
    keywords: "",
    introduction: "",
    methods: "",
    results: "",
    conclusion: "",
    references: "",
    topics: [],
  });

  const [submittedData, setSubmittedData] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setResearch({ ...research, [name]: value });
  };

  const handleTopicChange = (index, e) => {
    const { name, value } = e.target;
    const updatedTopics = [...research.topics];
    updatedTopics[index][name] = value;
    setResearch({ ...research, topics: updatedTopics });
  };

  const handleFileChange = (index, type, e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    const updatedTopics = [...research.topics];
    updatedTopics[index][type] = imageUrls;
    setResearch({ ...research, topics: updatedTopics });
  };

  const handleAddTopic = () => {
    setResearch({
      ...research,
      topics: [
        ...research.topics,
        { name: "", subtopics: [], images: [] },
      ],
    });
  };

  const handleAddSubtopic = (index) => {
    const updatedTopics = [...research.topics];
    updatedTopics[index].subtopics.push({ name: "", images: [] });
    setResearch({ ...research, topics: updatedTopics });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmittedData(research);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <h1 className="text-2xl font-bold text-center mb-5">Research CMS</h1>
      <form
        className="bg-white shadow-md rounded-lg p-6 max-w-3xl mx-auto"
        onSubmit={handleSubmit}
      >
        {/* Title (Mandatory) */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            name="title"
            className="w-full border rounded p-2"
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Abstract (Mandatory) */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Abstract</label>
          <textarea
            name="abstract"
            className="w-full border rounded p-2"
            onChange={handleInputChange}
            rows="4"
            required
          />
        </div>

        {/* Rights and Permissions (Mandatory) */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Rights and Permissions</label>
          <textarea
            name="rightsAndPermissions"
            className="w-full border rounded p-2"
            onChange={handleInputChange}
            rows="3"
            required
          />
        </div>

        {/* Authors (Mandatory) */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Authors</label>
          <input
            type="text"
            name="authors"
            className="w-full border rounded p-2"
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Keywords */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Keywords</label>
          <input
            type="text"
            name="keywords"
            className="w-full border rounded p-2"
            onChange={handleInputChange}
          />
        </div>

        {/* Introduction */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Introduction</label>
          <textarea
            name="introduction"
            className="w-full border rounded p-2"
            onChange={handleInputChange}
            rows="4"
          />
        </div>

        {/* Topics Section */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleAddTopic}
            className="bg-blue-500 text-white py-2 px-4 rounded"
          >
            Add Topic
          </button>
        </div>

        {research.topics.map((topic, index) => (
          <div key={index} className="mb-6">
            {/* Topic Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Topic Title</label>
              <input
                type="text"
                name="title"
                className="w-full border rounded p-2"
                value={topic.name}
                onChange={(e) => handleTopicChange(index, e)}
              />
            </div>

            {/* Topic Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Topic Description</label>
              <textarea
                name="description"
                className="w-full border rounded p-2"
                value={topic.description}
                onChange={(e) => handleTopicChange(index, e)}
              />
            </div>

            {/* Upload Image for Topic */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Upload Image for Topic</label>
              <input
                type="file"
                multiple
                accept="image/*"
                className="w-full border rounded p-2"
                onChange={(e) => handleFileChange(index, "images", e)}
              />
              {topic.images.length > 0 && (
                <div>
                  {topic.images.map((image, imgIndex) => (
                    <img
                      key={imgIndex}
                      src={image}
                      alt={`Topic Image ${imgIndex + 1}`}
                      className="w-32 h-auto mt-2"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Add Subtopics */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => handleAddSubtopic(index)}
                className="bg-green-500 text-white py-2 px-4 rounded"
              >
                Add Subtopic
              </button>
            </div>

            {topic.subtopics.map((subtopic, subIndex) => (
              <div key={subIndex} className="mb-4">
                {/* Subtopic Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Subtopic Title</label>
                  <input
                    type="text"
                    name="title"
                    className="w-full border rounded p-2"
                    value={subtopic.name}
                    onChange={(e) => handleTopicChange(index, e, subIndex)}
                  />
                </div>

                {/* Subtopic Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Subtopic Description</label>
                  <textarea
                    name="description"
                    className="w-full border rounded p-2"
                    value={subtopic.description}
                    onChange={(e) => handleTopicChange(index, e, subIndex)}
                  />
                </div>

                {/* Upload Image for Subtopic */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Upload Image for Subtopic</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="w-full border rounded p-2"
                    onChange={(e) => handleFileChange(index, "subtopics", e)}
                  />
                  {subtopic.images.length > 0 && (
                    <div>
                      {subtopic.images.map((image, imgIndex) => (
                        <img
                          key={imgIndex}
                          src={image}
                          alt={`Subtopic Image ${imgIndex + 1}`}
                          className="w-32 h-auto mt-2"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Methods */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Methods</label>
          <textarea
            name="methods"
            className="w-full border rounded p-2"
            onChange={handleInputChange}
            rows="4"
          />
        </div>

        {/* Results */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Results</label>
          <textarea
            name="results"
            className="w-full border rounded p-2"
            onChange={handleInputChange}
            rows="4"
          />
        </div>

        {/* Conclusion (Mandatory) */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Conclusion</label>
          <textarea
            name="conclusion"
            className="w-full border rounded p-2"
            onChange={handleInputChange}
            rows="4"
            required
          />
        </div>

        {/* References */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">References</label>
          <textarea
            name="references"
            className="w-full border rounded p-2"
            onChange={handleInputChange}
            rows="4"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded w-full"
        >
          Submit
        </button>
      </form>

      {/* Display Submitted Data */}
      {submittedData && (
        <div className="mt-10 p-5 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-bold">Submitted Data</h2>
          <pre className="bg-gray-100 p-4">{JSON.stringify(submittedData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Dashboard;