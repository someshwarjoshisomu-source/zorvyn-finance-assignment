import { useCallback, useState } from "react";
import api from "../api/axios";

export default function usePaginatedRecords(initialPerPage = 10) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(initialPerPage);

  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const fetchRecords = useCallback(
    async (
      pageNum = 1,
      type = filterType,
      category = filterCategory,
      search = filterSearch,
      startDate = filterStartDate,
      endDate = filterEndDate,
      silent = false,
      perPage = recordsPerPage,
    ) => {
      // Backward compatibility with previous call shape:
      // fetchRecords(page, type, category, search, silent, perPage)
      if (typeof startDate === "boolean") {
        silent = startDate;
        perPage = typeof endDate === "number" ? endDate : recordsPerPage;
        startDate = filterStartDate;
        endDate = filterEndDate;
      }

      if (!silent) setLoading(true);
      try {
        const params = { page: pageNum, limit: perPage };
        if (type) params.type = type;
        if (category) params.category = category;
        if (search) params.search = search;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const res = await api.get("/records", { params });
        const payload = res?.data?.data || res?.data;

        if (!payload) {
          setRecords([]);
          setTotalPages(1);
          setPage(1);
          setError("Failed to fetch records");
          return null;
        }

        const incomingRecords = Array.isArray(payload?.records) ? payload.records : [];
        const hasServerPagination = Boolean(payload?.totalPages || payload?.currentPage);
        const totalCount = Number(payload?.count) || incomingRecords.length;

        let parsedRecords = incomingRecords;
        let parsedTotalPages = Number(payload?.totalPages) || Math.max(1, Math.ceil(totalCount / perPage));
        let parsedCurrentPage = Number(payload?.currentPage) || pageNum;

        if (!hasServerPagination) {
          parsedTotalPages = Math.max(1, Math.ceil(totalCount / perPage));
          parsedCurrentPage = Math.min(Math.max(1, pageNum), parsedTotalPages);
          const startIndex = (parsedCurrentPage - 1) * perPage;
          parsedRecords = incomingRecords.slice(startIndex, startIndex + perPage);
        }

        setRecords(parsedRecords);
        setTotalPages(parsedTotalPages);
        setPage(parsedCurrentPage);
        setError("");

        return {
          records: parsedRecords,
          totalPages: parsedTotalPages,
          currentPage: parsedCurrentPage,
        };
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to fetch records");
        setRecords([]);
        setTotalPages(1);
        setPage(1);
        return null;
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [recordsPerPage],
  );

  return {
    records,
    loading,
    error,
    page,
    totalPages,
    recordsPerPage,
    filterType,
    filterCategory,
    filterSearch,
    filterStartDate,
    filterEndDate,
    setPage,
    setRecords,
    setTotalPages,
    setRecordsPerPage,
    setFilterType,
    setFilterCategory,
    setFilterSearch,
    setFilterStartDate,
    setFilterEndDate,
    setError,
    fetchRecords,
  };
}
