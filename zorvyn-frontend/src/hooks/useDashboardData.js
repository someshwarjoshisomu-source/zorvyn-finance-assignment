import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";

export default function useDashboardData({
  includeCategories = false,
  includeTrends = false,
  includeLast7DaysTrends = false,
  includeRecent = false,
  includeUsers = false,
  preload = true,
} = {}) {
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [trends, setTrends] = useState([]);
  const [last7DaysTrends, setLast7DaysTrends] = useState([]);
  const [recent, setRecent] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(preload);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const requests = [api.get("/dashboard/summary")];
      if (includeCategories) requests.push(api.get("/dashboard/categories"));
      if (includeTrends) requests.push(api.get("/dashboard/trends"));
      if (includeLast7DaysTrends) requests.push(api.get("/dashboard/trends/last7days"));
      if (includeRecent) requests.push(api.get("/dashboard/recent"));
      if (includeUsers) requests.push(api.get("/users"));

      const responses = await Promise.all(requests);
      let cursor = 0;

      setSummary(responses[cursor]?.data?.data || null);
      cursor += 1;

      if (includeCategories) {
        setCategories(responses[cursor]?.data?.data || []);
        cursor += 1;
      } else {
        setCategories([]);
      }
      if (includeTrends) {
        setTrends(responses[cursor]?.data?.data || []);
        cursor += 1;
      } else {
        setTrends([]);
      }
      if (includeLast7DaysTrends) {
        setLast7DaysTrends(responses[cursor]?.data?.data || []);
        cursor += 1;
      } else {
        setLast7DaysTrends([]);
      }
      if (includeRecent) {
        setRecent(responses[cursor]?.data?.data || []);
        cursor += 1;
      } else {
        setRecent([]);
      }
      if (includeUsers) {
        setUsers(responses[cursor]?.data?.users || []);
      } else {
        setUsers([]);
      }

      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [includeCategories, includeRecent, includeTrends, includeLast7DaysTrends, includeUsers]);

  useEffect(() => {
    if (preload) fetchData();
  }, [fetchData, preload]);

  return {
    summary,
    categories,
    trends,
    last7DaysTrends,
    recent,
    users,
    loading,
    error,
    setUsers,
    fetchData,
  };
}
