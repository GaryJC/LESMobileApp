import axios from "axios";

export async function get(url, params) {
  try {
    const response = await axios.get(url, params);
    return response;
  } catch (e) {
    console.log(e);
    return e;
  }
}

export async function post(url, body) {
  try {
    const response = await axios.post(url, body);
    return response;
  } catch (e) {
    console.log(e);
    return e;
  }
}
