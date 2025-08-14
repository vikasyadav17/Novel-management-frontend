import axios from "axios";

const BASE_URL = "http://localhost:8080/novels";

export const novelApi = {
  /**
   * Fetches all novels, optionally filtered by name and genre.
   * Expected response format:
   * [
   *   {
   *     link: string,
   *     originalName: string,
   *     name: string,
   *     genre: string,
   *     novelDetails: {
   *       description: string,
   *       mcName: string | null,
   *       mcCheating: boolean,
   *       specialCharacteristicOfMc: string | null,
   *       id: number
   *     }
   *   },
   *   ...
   * ]
   */
  getAllNovels: async (name, genre) => {
    const params = {};
    if (name) params.name = name;
    if (genre) params.genre = genre;
    return axios.get(`${BASE_URL}/all`, { params });
  },

  addNovel: async (novelData) => {
    return axios.post(BASE_URL, novelData);
  },

  updateNovel: async (id, updates) => {
    return axios.patch(`${BASE_URL}/${id}`, updates);
  },

  getNovelCount: async () => {
    return axios.get(`${BASE_URL}/count`);
  },
};
