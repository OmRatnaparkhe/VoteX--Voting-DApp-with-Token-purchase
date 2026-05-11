import axios from "axios";
import { API_URL } from "../config/constants";

export const uploadVoterImage = async (file) => {
  try {
   
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("token");
    // Set headers in config
    const config = {
      headers: {
        'x-access-token': token,
        'Content-Type': 'multipart/form-data'
      }
    };
    const res = await axios.post(`${API_URL}/postVoterImage`, formData, config);
    console.log(res);
    if (res.status === 200) { 
      return true;
    }
    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
};