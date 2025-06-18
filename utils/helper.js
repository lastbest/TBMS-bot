// utils/helper.js
export const getToday = () => {
  const dateToday = new Date();
  const yyyy = dateToday.getFullYear();
  const mm = String(dateToday.getMonth() + 1).padStart(2, "0");
  const dd = String(dateToday.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
};
