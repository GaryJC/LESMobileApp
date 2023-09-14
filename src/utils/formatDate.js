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
