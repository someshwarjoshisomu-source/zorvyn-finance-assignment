import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../api/axios";
import RecordsFilters from "./dashboard/RecordsFilters";
import RecordsTable from "./dashboard/RecordsTable";
import RecordModal from "./dashboard/RecordModal";
import PaginationControls from "./dashboard/PaginationControls";
import AnalyticsSection from "./dashboard/AnalyticsSection";
import BackendShowcase from "./dashboard/BackendShowcase";
import AddRecordForm from "./dashboard/AddRecordForm";
import UsersManagementTable from "./users/UsersManagementTable";
import Loader from "./common/Loader";
import ErrorMessage from "./common/ErrorMessage";
import { useAuth } from "../context/AuthContext";
import useDashboardData from "../hooks/useDashboardData";
import usePaginatedRecords from "../hooks/usePaginatedRecords";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const canManage = user?.role !== "VIEWER";

  const {
    summary,
    categories,
    trends,
    users,
    loading: dashboardLoading,
    error: dashboardError,
    fetchData,
  } = useDashboardData({ includeCategories: true, includeTrends: true, includeUsers: true });

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

  const handleCreateRecord = async (payload) => {
    if (saving) return false;
    setSaving(true);

    try {
      await api.post("/records", payload);
      toast.success("Record added successfully");
      await fetchData();
      await fetchRecords(1, filterType, filterCategory, filterSearch, filterStartDate, filterEndDate, false, recordsPerPage);
      setShowAddForm(false);
      return true;
    } catch (err) {
      if (err.response?.data?.errors) {
        err.response.data.errors.forEach((item) => toast.error(item.message || item));
      } else {
        toast.error(err.response?.data?.message || "Unable to add record");
      }
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleEditRecord = (record) => {
    setEditRecord(record);
  };

  const handleUpdateRecord = async (payload) => {
    if (saving || !editRecord) return false;
    setSaving(true);
    try {
      await api.put(`/records/${editRecord._id}`, payload);
      toast.success("Record updated successfully");
      setEditRecord(null);
      await fetchData();
      await fetchRecords(page, filterType, filterCategory, filterSearch, filterStartDate, filterEndDate, false, recordsPerPage);
      return true;
    } catch (err) {
      if (err.response?.data?.errors) {
        err.response.data.errors.forEach((item) => toast.error(item.message || item));
      } else {
        toast.error(err.response?.data?.message || "Unable to update record");
      }
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (saving) return;
    setSaving(true);
    try {
      await api.delete(`/records/${id}`);
      toast.success("Record deleted");
      await fetchRecords(page, filterType, filterCategory, filterSearch, filterStartDate, filterEndDate, false, recordsPerPage);
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleUserStatus = async (id, currentStatus) => {
    if (saving) return;
    setSaving(true);
    try {
      await api.patch(`/users/${id}/status`, {
        status: currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      });
      toast.success("User status updated");
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Status update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleChangeUserRole = async (id, role) => {
    if (saving) return;
    setSaving(true);
    try {
      await api.patch(`/users/${id}/role`, { role });
      toast.success("User role updated");
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Role update failed");
    } finally {
      setSaving(false);
    }
  };

  if (busy) return <Loader message="Loading admin dashboard..." />;
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
      <AnalyticsSection
        summary={summary}
        categories={categories}
        trends={trends}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="zf-section" id="records">
          <div className="zf-section__head">
            <h2 className="zf-section__title">Records Management</h2>
            {canManage ? (
              <button
                type="button"
                className="zf-btn zf-btn-success"
                onClick={() => setShowAddForm((prev) => !prev)}
                aria-expanded={showAddForm}
                aria-controls="add-record-form"
              >
                {showAddForm ? "Close Form" : "Add Record"}
              </button>
            ) : null}
          </div>

          {canManage && showAddForm ? (
            <div id="add-record-form">
              <AddRecordForm onSubmit={handleCreateRecord} busy={saving} />
            </div>
          ) : null}

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
            disabled={recordsLoading || saving}
          />

          <RecordsTable
            records={records}
            showActions={canManage}
            onDelete={handleDeleteRecord}
            onEdit={handleEditRecord}
            busy={saving}
          />

          <RecordModal
            open={canManage && !!editRecord}
            onClose={() => setEditRecord(null)}
            onSubmit={handleUpdateRecord}
            initialData={editRecord}
            busy={saving}
          />

          <PaginationControls
            page={page}
            totalPages={totalPages}
            recordsPerPage={recordsPerPage}
            onPerPageChange={handlePerPageChange}
            onPageChange={handlePageChange}
            disabled={recordsLoading || saving}
          />
        </section>

        <UsersManagementTable
          users={users}
          onToggleStatus={handleToggleUserStatus}
          onChangeRole={handleChangeUserRole}
          busy={saving}
          canManage={canManage}
        />
      </div>

      <BackendShowcase
        title="Live API Logs"
        payload={{
          role: user?.role,
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
          usersCount: users.length,
        }}
      />
    </div>
  );
}
