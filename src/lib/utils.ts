import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}



export const createFormData = (
  payload: Record<string, unknown>
): FormData => {
  const formData = new FormData();
  const appendValue = (key: string, value: unknown): void => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return;
    }
    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
      return;
    }
    if (value instanceof Date) {
      formData.append(key, value.toISOString());
      return;
    }

    if (value instanceof FileList) {
      Array.from(value).forEach((file) => {
        formData.append(key, file);
      });
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => appendValue(key, item));
      return;
    }
    if (typeof value === "object") {
      const obj = value as Record<string, unknown>;

      if ("_id" in obj && obj._id) {
        formData.append(key, String(obj._id));
      } else {
        formData.append(key, JSON.stringify(obj));
      }
      return;
    }

    formData.append(key, String(value));
  };

  Object.entries(payload).forEach(([key, value]) => {
    appendValue(key, value);
  });

  return formData;
};
