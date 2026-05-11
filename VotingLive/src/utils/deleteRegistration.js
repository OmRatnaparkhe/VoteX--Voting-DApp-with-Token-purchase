import axios from "axios";

export const deleteVoterRegistration = async () => {
  try {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        'x-access-token': token
      }
    };
    const res = await axios.delete("http://localhost:3000/api/deleteVoterRegistration", config);
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
    const res = await axios.delete("http://localhost:3000/api/deleteCandidateRegistration", config);
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
