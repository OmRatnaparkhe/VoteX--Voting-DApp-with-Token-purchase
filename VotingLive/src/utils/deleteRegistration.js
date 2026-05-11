import axios from "axios";
import { API_URL } from "../config/constants";

export const deleteVoterRegistration = async () => {
  try {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        'x-access-token': token
      }
    };
    const res = await axios.delete(`${API_URL}/deleteVoterRegistration`, config);
    if (res.data.message === "Registration deleted successfully") {
      return { success: true, message: res.data.message };
    }
    return { success: false, message: "Unexpected response from server" };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { success: false, message: "No profile found on server to delete." };
    }
    console.error(error);
    return { success: false, message: "An error occurred during deletion." };
  }
};

export const deleteCandidateRegistration = async () => {
  try {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        'x-access-token': token
      }
    };
    const res = await axios.delete(`${API_URL}/deleteCandidateRegistration`, config);
    if (res.data.message === "Registration deleted successfully") {
      return { success: true, message: res.data.message };
    }
    return { success: false, message: "Unexpected response from server" };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { success: false, message: "No profile found on server to delete." };
    }
    console.error(error);
    return { success: false, message: "An error occurred during deletion." };
  }
};
