/**
 * Converts a timestamp to relative time in Spanish
 * @param {string|Date} timestamp - The timestamp to convert
 * @returns {string} - Relative time string ('hoy', 'ayer', 'esta semana', etc.)
 */
export const getRelativeTime = (timestamp) => {
  if (!timestamp) return 'N/A';

  const date = new Date(timestamp);
  const now = new Date();

  // Set times to start of day for accurate date comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffTime = today - targetDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Today
  if (diffDays === 0) {
    return 'hoy';
  }

  // Yesterday
  if (diffDays === 1) {
    return 'ayer';
  }

  // This week (within 7 days)
  if (diffDays <= 7) {
    return 'esta semana';
  }

  // This month
  if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
    return 'este mes';
  }

  // Calculate months difference
  const monthsDiff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());

  if (monthsDiff === 1) {
    return 'hace 1 mes';
  } else if (monthsDiff > 1) {
    return `hace ${monthsDiff} meses`;
  }

  // Fallback for edge cases
  return date.toLocaleDateString('es-ES');
};

/**
 * Formats time for kitchen orders with precise minute intervals
 * @param {string} timeString - The time string in format "HH:MM" or timestamp
 * @returns {string} - Formatted time string for kitchen display
 */
export const formatTimeComanda = (timeString, day) => {
  if (!timeString) return "N/A";

  let orderTime;

  if (day) {
    const now = new Date();
    const [d, m, y] = day.split('-').map(Number);
    if (
      d === now.getDate() &&
      m === now.getMonth() + 1
    ) {
      // Check if it's a time format (HH:MM) or a full timestamp
      if (typeof timeString === 'string' && timeString.match(/^\d{2}:\d{2}$/)) {
        // It's in HH:MM format, create a date for today with this time
        const now = new Date();
        const [hours, minutes] = timeString.split(':').map(Number);
        orderTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
      } else {
        // It's a full timestamp
        orderTime = new Date(timeString);
      }

      const now = new Date();
      const diffMinutes = Math.floor((now - orderTime) / 60000);
      if (diffMinutes < 1) {
        return 'recién';
      } else if (diffMinutes <= 7) { //los numeros son asi para intervales mas reales
        return 'hace 5 min';
      } else if (diffMinutes <= 13) {
        return 'hace 10 min';
      } else if (diffMinutes <= 18) {
        return 'hace 15 min';
      } else if (diffMinutes <= 23) {
        return 'hace 20 min';
      } else if (diffMinutes <= 33) {
        return 'hace 30 min';
      } else if (diffMinutes <= 43) {
        return 'hace 45 min';
      } else if (diffMinutes < 55) {
        return 'hace 1 hora';
      } else {
        return 'más de 1 hora';
      }
    } else {
      return `${d}/${m}`; //pone la fecha en formato lindo 
    }
  }

};

/**
 * Formats a timestamp to a readable time string
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} - Formatted time string
 */
export const formatTime = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Gets elapsed time in human readable format
 * @param {string|Date} timestamp - The timestamp to calculate from
 * @returns {string} - Elapsed time string
 */
// export const getElapsedTime = (timestamp) => {
//     console.log(timestamp)
//   if (!timestamp) return "N/A";

//   const orderTime = new Date(timestamp);
//   const now = new Date();
//   const diffSeconds = Math.floor((now - orderTime) / 1000);

//   if (diffSeconds < 60) return `< 1 min`;
//   const diffMinutes = Math.floor(diffSeconds / 60);
//   if (diffMinutes < 60) return `${diffMinutes} min`;

//   const hours = Math.floor(diffMinutes / 60);
//   const remainingMinutes = diffMinutes % 60;
//   if (remainingMinutes === 0) return `${hours} h`;
//   return `${hours}h ${remainingMinutes}m`;
// };
