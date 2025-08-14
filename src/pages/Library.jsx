import { useState, useEffect } from "react";
import { novelApi } from "../services/novelApi";
import NovelCard from "../components/NovelCard";

function Library() {
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <div>Loading novels...</div>;
  if (error) return <div>{error}</div>;

  return (
    <section className="novels-grid">
      {novels.map((novel) => (
        <NovelCard
          key={novel.id}
          id={novel.id}
          link={novel.link}
          originalName={novel.originalName}
          name={novel.name}
          genre={novel.genre}
        />
      ))}
    </section>
  );
}

export default Library;
