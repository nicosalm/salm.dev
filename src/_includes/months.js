export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function monthName(date) {
  return MONTHS[new Date(date).getUTCMonth()];
}
