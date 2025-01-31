const Subtopic = ({ subtopic, topicIndex, subIndex, onSubtopicChange, onFileChange }) => {
    return (
      <div className="mb-4">
        {/* Subtopic Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Subtopic Title</label>
          <input
            type="text"
            name="name"
            className="w-full border rounded p-2"
            value={subtopic.name}
            onChange={(e) =>  onSubtopicChange(topicIndex, subIndex, "name", e.target.value)}
          />
        </div>
  
        {/* Subtopic Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Subtopic Description</label>
          <textarea
            name="description"
            className="w-full border rounded p-2"
            value={subtopic.description || ""}
            onChange={(e) =>
              onSubtopicChange(topicIndex, subIndex, "description", e.target.value)
            }
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
            onChange={(e) => onFileChange(topicIndex, "subtopics", e)}
          />
          {subtopic.images && subtopic.images.length > 0 && (
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
    );
  };
  
  export default Subtopic