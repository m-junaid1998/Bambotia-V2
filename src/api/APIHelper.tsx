export const dataToQueryParameter = (
  data: Record<string, unknown> | string | undefined | null,
): string => {
  if (typeof data === "string") {
    return data;
  }
  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    const dataArray = Object.entries(data).filter(([, value]) => value !== undefined && value !== null);
    if (dataArray.length > 0) {
      const params = dataArray
        .map(([key, value]) => `${key}=${value}`)
        .join("&");
      return `?${params}`;
    }
  }
  return "";
};