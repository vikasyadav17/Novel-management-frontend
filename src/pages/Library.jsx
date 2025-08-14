import { useState, useEffect } from "react";
import { novelApi } from "../services/novelApi";

function Library() {
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    loadNovels();
  }, []);

  const loadNovels = async () => {
    try {
      const response = await novelApi.getAllNovels();
      setNovels(response.data);
    } catch {
      setError("Failed to load novels");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (novel) => {
    setEditId(novel.novelDetails?.id || novel.id);
    setEditData({
      name: novel.name,
      originalName: novel.originalName,
      genre: novel.genre,
      description: novel.novelDetails?.description || "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSave = async (id) => {
    try {
      await novelApi.updateNovel(id, {
        name: editData.name,
        originalName: editData.originalName,
        genre: editData.genre,
        description: editData.description,
      });
      setEditId(null);
      setEditData({});
      loadNovels();
    } catch (err) {
      setError("Failed to update novel");
    }
  };

  if (loading) return <div>Loading novels...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="library-table-container">
      <table className="library-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Original Name</th>
            <th>Genre</th>
            <th>Description</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {novels.map((novel) => {
            const id = novel.novelDetails?.id || novel.id;
            const isEditing = editId === id;
            return (
              <tr key={id}>
                <td>{id}</td>
                <td>
                  {isEditing ? (
                    <input
                      name="name"
                      value={editData.name}
                      onChange={handleEditChange}
                    />
                  ) : novel.link ? (
                    <a
                      href={novel.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#2980b9", textDecoration: "none" }}
                    >
                      {novel.name}
                    </a>
                  ) : (
                    novel.name
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <input
                      name="originalName"
                      value={editData.originalName}
                      onChange={handleEditChange}
                    />
                  ) : (
                    novel.originalName
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <input
                      name="genre"
                      value={editData.genre}
                      onChange={handleEditChange}
                    />
                  ) : (
                    novel.genre
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <textarea
                      name="description"
                      value={editData.description}
                      onChange={handleEditChange}
                      rows={3}
                      style={{ width: "100%" }}
                    />
                  ) : (
                    novel.novelDetails?.description || ""
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <>
                      <button onClick={() => handleEditSave(id)}>Save</button>
                      <button onClick={() => setEditId(null)}>Cancel</button>
                    </>
                  ) : (
                    <button
                      className="edit-pencil-btn"
                      title="Edit"
                      onClick={() => handleEditClick(novel)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2980b9"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ opacity: 0.6 }}
                      >
                        <rect
                          x="2"
                          y="4"
                          width="20"
                          height="16"
                          rx="2"
                          ry="2"
                          stroke="none"
                          fill="#fff"
                        />
                        <path d="M16.5 7.5L19 10L8 21H5v-3L16.5 7.5z" />
                        <path d="M18 2a2.828 2.828 0 1 1 4 4L19 7l-4-4 3-3z" />
                      </svg>
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Library;
