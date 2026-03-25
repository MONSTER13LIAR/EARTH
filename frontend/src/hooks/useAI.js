import { useCallback, useState } from "react";

export function useAI(apiFunction) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const execute = useCallback(
    async (payload) => {
      setLoading(true);
      setError("");

      try {
        const response = await apiFunction(payload);
        setData(response);
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : "AI request fail hua";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  return {
    loading,
    error,
    data,
    execute,
  };
}
