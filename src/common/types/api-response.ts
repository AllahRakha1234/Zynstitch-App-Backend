export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
}

export function ok<T>(data: T, message: string): ApiResponse<T> {
  return { success: true, data, message };
}

export function fail<T = null>(
  message: string,
  data: T | null = null,
): ApiResponse<T> {
  return { success: false, data, message };
}
