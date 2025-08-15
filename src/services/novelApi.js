import axios from "axios";

// Fix the BASE_URL to match your backend
const BASE_URL = "http://localhost:8080/novels";

console.log("novelApi: BASE_URL is set to:", BASE_URL);

export const novelApi = {
  getAllNovels: () => {
    return axios.get(`${BASE_URL}/all`);
  },

  addNovel: async (novelData) => {
    console.log(
      "novelApi.addNovel: STARTING - Function called with data:",
      novelData
    );

    try {
      const url = BASE_URL;
      console.log("novelApi.addNovel: URL:", url);
      console.log("novelApi.addNovel: Making fetch request...");

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(novelData),
      });

      console.log("novelApi.addNovel: Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("novelApi.addNovel: Error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if the response is in text format
      const contentType = response.headers.get("content-type");
      let result;
      if (contentType && contentType.includes("text/plain")) {
        // If the response is plain text, just return the text
        const textResult = await response.text();
        console.log("novelApi.addNovel: Success text response:", textResult);
        return textResult;
      } else {
        // Otherwise, parse the response as JSON
        result = await response.json();
        console.log("novelApi.addNovel: Success result:", result);
        return result;
      }
    } catch (error) {
      console.error("novelApi.addNovel: ERROR in catch block:", error);
      throw error;
    }
  },

  updateNovel: async (id, novelData) => {
    return axios.patch(`${BASE_URL}/${id}`, novelData, {
      headers: { "Content-Type": "application/json" },
    });
  },

  getNovelCount: async () => {
    return axios.get(`${BASE_URL}/count`);
  },

  bulkUploadNovels: async (novels) => {
    return axios.post(`${BASE_URL}/bulk`, novels, {
      headers: { "Content-Type": "application/json" },
    });
  },

  getNovelById: async (id) => {
    return axios.get(`${BASE_URL}/${id}`);
  },

  getNovelByName: (name) => axios.get(BASE_URL, { params: { name } }), // Updated to use BASE_URL
};
