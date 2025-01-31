import Subtopic from "./SubTopic";

const Topic = ({ topic, index, onTopicChange, onSubtopicAdd, onFileChange }) => {
  return (
    <div key={index} className="mb-6">
      {/* Topic Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Topic Title</label>
        <input
          type="text"
          name="name"
          className="w-full border rounded p-2"
          value={topic.name}
          onChange={(e) => onTopicChange(index, e)}
        />
      </div>

      {/* Topic Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Topic Description</label>
        <textarea
          name="description"
          className="w-full border rounded p-2"
          value={topic.description || ""}
          onChange={(e) => onTopicChange(index, e)}
        />
      </div>

      {/* Upload Image */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Upload Image</label>
        <input
          type="file"
          multiple
          accept="image/*"
          className="w-full border rounded p-2"
          onChange={(e) => onFileChange(index, "images", e)}
        />
        {topic.images && topic.images.length > 0 && (
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
          onClick={() => onSubtopicAdd(index)}
          className="bg-green-500 text-white py-2 px-4 rounded"
        >
          Add Subtopic
        </button>
      </div>

      {topic.subtopics.map((subtopic, subIndex) => (
        <Subtopic
          key={subIndex}
          subtopic={subtopic}
          topicIndex={index}
          subIndex={subIndex}
          onSubtopicChange={onTopicChange}
          onFileChange={onFileChange}
        />
      ))}
    </div>
  );
};
export default Topic
