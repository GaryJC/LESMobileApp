import API from "../../modules/Api";
import moment from "moment/moment";

const { fetchWithRevalidate } = API;

export const getSpecificLaunchpadData = async (id) => {
  return await fetchWithRevalidate(API.Launchpad.getSpecificLaunchpad(id));
};

export const getLaunchpadList = async (params) => {
  const queryString = new URLSearchParams(params).toString();
  return await fetchWithRevalidate(API.Launchpad.getLaunchpadList(queryString));
};

/**
 * Returns the index of the current phase based on the given phase array and current time.
 * @param {Array} phase - The array of phases.
 * @returns {number} - The index of the current phase. Returns -1 if no phase is current.
 */
export const getCurrentPhaseIndex = (phase) => {
  const currentTime = moment().valueOf();
  for (let i = 0; i < phase.length; i++) {
    if (i === phase.length - 1 || currentTime < phase[i + 1].openTime) {
      return i;
    }
  }
  return -1; // If no phase is current, return -1
};

export const formatTimeLeft = (timeLeft) => {
  return `${timeLeft.days}d : ${timeLeft.hours}h : ${timeLeft.minutes}m : ${timeLeft.seconds} s`;
};

/**
 * Retrieves the phase status information based on the given parameters.
 * @param {number} currentPhaseIndex - The index of the current phase.
 * @param {number} activityPhaseIndex - The index of the activity phase.
 * @returns {Object} - An object containing the color, status, and time typography.
 */
export const getPhaseStatusInfo = (currentPhaseIndex, activityPhaseIndex) => {
  let color = "";
  let status = "";

  if (currentPhaseIndex < activityPhaseIndex) {
    color = "bg-yellow-400";
    status = "Upcoming";
  } else if (currentPhaseIndex == activityPhaseIndex) {
    color = "bg-green-400";
    status = "Ongoing";
  } else {
    color = "bg-red-400";
    status = "Ended";
  }

  return { color, status };
};
