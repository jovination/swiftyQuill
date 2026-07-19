export function getDateRangeFromParam(range: string | string[] | undefined): { start: Date; end: Date } {
  const r = Array.isArray(range) ? range[0] : range;
  const end = new Date();
  const start = new Date();
  
  // Set end to the end of today
  end.setHours(23, 59, 59, 999);
  
  // Set start based on param
  start.setHours(0, 0, 0, 0);

  switch (r) {
    case "today":
      break;
    case "yesterday":
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
      end.setHours(0,0,0,0); // end of yesterday is basically start of today, but to be safe:
      end.setHours(23, 59, 59, 999);
      break;
    case "7d":
      start.setDate(start.getDate() - 7);
      break;
    case "90d":
      start.setDate(start.getDate() - 90);
      break;
    case "this_year":
      start.setMonth(0, 1);
      break;
    case "all":
      start.setFullYear(2000, 0, 1); // effectively all time
      break;
    case "30d":
    default:
      start.setDate(start.getDate() - 30);
      break;
  }

  return { start, end };
}
