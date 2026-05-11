export const sendResponse = (c: any, status: number, message: string, data?: any) => {
  return c.json({
    success: status >= 200 && status < 300,
    message,
    data
  }, status);
};
