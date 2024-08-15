/**
 *
 * @param {Date} date
 * @returns {formattedDate}
 */
export default function formatDate(date, options) {
  const op = options ?? {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };

  let formattedDate;
  //   if (timestamp) {
  formattedDate = new Intl.DateTimeFormat("en-US", op).format(date);
  //   }
  return formattedDate;
}

export function formatNumber(num) {
  if (!num) {
    return "TBA";
  }
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + "B"; // Billion
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + "M"; // Million
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + "K"; // Thousand
  } else if (num < 1 && num > 0) {
    return num.toFixed(4);
  } else {
    return num.toString();
  }
}
