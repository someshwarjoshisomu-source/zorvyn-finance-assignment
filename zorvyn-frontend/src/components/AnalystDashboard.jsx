import { useEffect } from "react";
import RecordsFilters from "./dashboard/RecordsFilters";
import RecordsTable from "./dashboard/RecordsTable";
import PaginationControls from "./dashboard/PaginationControls";
import AnalyticsSection from "./dashboard/AnalyticsSection";
import BackendShowcase from "./dashboard/BackendShowcase";
import Loader from "./common/Loader";
import ErrorMessage from "./common/ErrorMessage";
import useDashboardData from "../hooks/useDashboardData";
import usePaginatedRecords from "../hooks/usePaginatedRecords";

export default function AnalystDashboard() {
  const {
    summary,
    categories,
    trends,
    loading: dashboardLoading,
    error: dashboardError,
    fetchData,
  } = useDashboardData({ includeCategories: true, includeTrends: true });

  const {
    records,
    loading: recordsLoading,
    error: recordsError,
    page,
    totalPages,
    recordsPerPage,
    filterType,
    filterCategory,
    filterSearch,
    filterStartDate,
    filterEndDate,
    setRecordsPerPage,
    setFilterType,
    setFilterCategory,
    setFilterSearch,
    setFilterStartDate,
    setFilterEndDate,
    fetchRecords,
  } = usePaginatedRecords(10);

  useEffect(() => {
    fetchRecords(1, "", "", "", true, recordsPerPage);
  }, [fetchRecords, recordsPerPage]);

  const busy = dashboardLoading || recordsLoading;
  const hasError = dashboardError || recordsError;

  const handleApplyFilters = (event) => {
    event.preventDefault();
    fetchRecords(1, filterType, filterCategory, filterSearch, filterStartDate, filterEndDate, false, recordsPerPage);
  };

  const handlePageChange = (nextPage) => {
    if (nextPage >= 1 && nextPage <= totalPages) {
      fetchRecords(nextPage, filterType, filterCategory, filterSearch, filterStartDate, filterEndDate, false, recordsPerPage);
    }
  };

  const handlePerPageChange = (nextPerPage) => {
    setRecordsPerPage(nextPerPage);
    fetchRecords(1, filterType, filterCategory, filterSearch, filterStartDate, filterEndDate, false, nextPerPage);
  };

  if (busy) return <Loader message="Loading analyst dashboard..." />;
  if (hasError) {
    return (
      <ErrorMessage
        message={hasError}
        onRetry={() => {
          fetchData();
          fetchRecords(1, filterType, filterCategory, filterSearch, filterStartDate, filterEndDate, false, recordsPerPage);
        }}
      />
    );
  }

  return (
    <div className="zf-page-stack">
      <AnalyticsSection summary={summary} categories={categories} trends={trends} />

      <section className="zf-section" id="records">
        <h2 className="zf-section__title">Records</h2>
        <RecordsFilters
          filterType={filterType}
          filterCategory={filterCategory}
          filterSearch={filterSearch}
          filterStartDate={filterStartDate}
          filterEndDate={filterEndDate}
          onTypeChange={setFilterType}
          onCategoryChange={setFilterCategory}
          onSearchChange={setFilterSearch}
          onStartDateChange={setFilterStartDate}
          onEndDateChange={setFilterEndDate}
          onSubmit={handleApplyFilters}
          disabled={recordsLoading}
        />
        <RecordsTable records={records} />
        <PaginationControls
          page={page}
          totalPages={totalPages}
          recordsPerPage={recordsPerPage}
          onPerPageChange={handlePerPageChange}
          onPageChange={handlePageChange}
          disabled={recordsLoading}
        />
      </section>

      <BackendShowcase
        title="Live API Logs"
        payload={{
          summary,
          filters: {
            type: filterType,
            category: filterCategory,
            search: filterSearch,
            startDate: filterStartDate,
            endDate: filterEndDate,
            page,
            recordsPerPage,
          },
          recordsCount: records.length,
          categoriesCount: categories.length,
          trendsCount: trends.length,
        }}
      />
    </div>
  );
}
