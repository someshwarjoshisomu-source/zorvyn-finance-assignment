import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "../styles/dashboard-modular.css";
import MainLayout from "../components/layout/MainLayout";
import Loader from "../components/common/Loader";
import AuditLog from "../components/dashboard/AuditLog";
import RecordsFilters from "../components/dashboard/RecordsFilters";
import RecordsTable from "../components/dashboard/RecordsTable";
import RecordModal from "../components/dashboard/RecordModal";
import PaginationControls from "../components/dashboard/PaginationControls";
import LiveApiConsole from "../components/dashboard/LiveApiConsole";
import UsersManagementTable from "../components/users/UsersManagementTable";
import useDashboardData from "../hooks/useDashboardData";
import usePaginatedRecords from "../hooks/usePaginatedRecords";

const AnalyticsSection = lazy(() => import("../components/dashboard/AnalyticsSection"));

export default function Dashboard() {
  const { user, logout, loading, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [saving, setSaving] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [dashboardMode, setDashboardMode] = useState("summary");

  // Determine what data to fetch based on user role
  // VIEWER: summary only
  // ANALYST: summary, categories, trends
  // ADMIN: summary, categories, trends, users
  const canViewAnalytics = user?.role === "ANALYST" || user?.role === "ADMIN";
  const canManageUsers = user?.role === "ADMIN";

  // Data hooks - respect RBAC restrictions
  const {
    summary,
    categories,
    trends,
    last7DaysTrends,
    users,
    setUsers,
    loading: dashboardLoading,
    error: dashboardError,
    fetchData,
  } = useDashboardData({
    includeCategories: canViewAnalytics,
    includeTrends: canViewAnalytics,
    includeLast7DaysTrends: canViewAnalytics,
    includeUsers: canManageUsers,
    preload: false,
  });

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

  // Local input state - separate from hook filter state to prevent auto-fetches
  const [inputType, setInputType] = useState("");
  const [inputCategory, setInputCategory] = useState("");
  const [inputSearch, setInputSearch] = useState("");
  const [inputStartDate, setInputStartDate] = useState("");
  const [inputEndDate, setInputEndDate] = useState("");

  // Initialize input state from hook state on mount
  useEffect(() => {
    setInputType(filterType);
    setInputCategory(filterCategory);
    setInputSearch(filterSearch);
    setInputStartDate(filterStartDate);
    setInputEndDate(filterEndDate);
  }, []);

  // Sync input state when role changes (reset filters)
  useEffect(() => {
    if (user?.role) {
      setInputType("");
      setInputCategory("");
      setInputSearch("");
      setInputStartDate("");
      setInputEndDate("");
      setDashboardMode("summary");
    }
  }, [user?.role]);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      if (id === "analytics") {
        setDashboardMode(canViewAnalytics ? "analytics" : "summary");
      }
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [location.hash, canViewAnalytics]);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  // Initial records fetch
  useEffect(() => {
    fetchRecords(1, "", "", "", true, recordsPerPage);
  }, [fetchRecords, recordsPerPage]);

  // Re-fetch data when role changes
  useEffect(() => {
    if (user?.role) {
      fetchData();
      fetchRecords(1, "", "", "", true, recordsPerPage);
    }
  }, [user?.role, fetchData, fetchRecords, recordsPerPage]);

  const busy = loading || dashboardLoading || recordsLoading;
  const hasError = dashboardError || recordsError;

  const getUserId = (candidate) => candidate?.id || candidate?._id;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleApplyFilters = (event) => {
    event.preventDefault();
    
    // First, update hook state with input values
    setFilterType(inputType);
    setFilterCategory(inputCategory);
    setFilterSearch(inputSearch);
    setFilterStartDate(inputStartDate);
    setFilterEndDate(inputEndDate);
    
    // Then immediately fetch with the input values
    // Using setTimeout to ensure state updates happen first
    setTimeout(() => {
      fetchRecords(1, inputType, inputCategory, inputSearch, inputStartDate, inputEndDate, false, recordsPerPage);
    }, 0);
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

  const handleEditRecord = (record) => {
    setEditRecord(record);
  };

  const handleUpdateRecord = async (payload) => {
    if (saving || !editRecord) return false;
    setSaving(true);
    try {
      // Check if this is a new record (create) or existing record (update)
      const isCreating = !editRecord._id;
      
      if (isCreating) {
        // Create new record
        await api.post(`/records`, payload);
        toast.success("Record created successfully");
      } else {
        // Update existing record
        await api.patch(`/records/${editRecord._id}`, payload);
        toast.success("Record updated successfully");
      }
      
      setEditRecord(null);
      await fetchData();
      await fetchRecords(page, filterType, filterCategory, filterSearch, filterStartDate, filterEndDate, false, recordsPerPage);
      return true;
    } catch (err) {
      if (err.response?.data?.errors) {
        err.response.data.errors.forEach((item) => toast.error(item.message || item));
      } else {
        toast.error(err.response?.data?.message || "Unable to save record");
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

  const isCurrentUser = (candidate) => {
    const currentId = getUserId(user);
    const candidateId = getUserId(candidate);
    if (!currentId || !candidateId) return false;
    return String(currentId) === String(candidateId);
  };

  const handleToggleUserStatus = async (id, currentStatus) => {
    if (saving) return;
    setSaving(true);
    try {
      const response = await api.patch(`/users/${id}/status`, {
        status: currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      });

      const updatedUser = response?.data?.user;
      if (updatedUser) {
        setUsers((prev) =>
          prev.map((item) =>
            String(getUserId(item)) === String(getUserId(updatedUser)) ? updatedUser : item,
          ),
        );

        if (isCurrentUser(updatedUser)) {
          updateUser(updatedUser);

          if (updatedUser.status === "INACTIVE") {
            toast.success("User status updated");
            toast("Your account was deactivated. Please sign in again.");
            handleLogout();
            return;
          }
        }
      } else {
        await fetchData();
      }

      toast.success("User status updated");
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
      const response = await api.patch(`/users/${id}/role`, { role });

      const updatedUser = response?.data?.user;
      if (updatedUser) {
        setUsers((prev) =>
          prev.map((item) =>
            String(getUserId(item)) === String(getUserId(updatedUser)) ? updatedUser : item,
          ),
        );

        if (isCurrentUser(updatedUser)) {
          updateUser(updatedUser);
        }
      } else {
        await fetchData();
      }

      toast.success("User role updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Role update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateUser = async (payload) => {
    if (saving) return false;
    setSaving(true);
    try {
      const response = await api.post("/users", payload);
      const createdUser = response?.data?.user;

      if (createdUser) {
        setUsers((prev) => [createdUser, ...prev]);
      } else {
        await fetchData();
      }

      toast.success("User created");
      return true;
    } catch (err) {
      if (err.response?.data?.errors) {
        err.response.data.errors.forEach((item) => toast.error(item.message || item));
      } else {
        toast.error(err.response?.data?.message || "Create user failed");
      }
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateUser = async (id) => {
    if (saving || !id) return;
    setSaving(true);
    try {
      const response = await api.delete(`/users/${id}`);
      const updatedUser = response?.data?.user;

      if (updatedUser) {
        setUsers((prev) =>
          prev.map((item) =>
            String(getUserId(item)) === String(getUserId(updatedUser)) ? updatedUser : item,
          ),
        );

        if (isCurrentUser(updatedUser)) {
          updateUser(updatedUser);
          toast.success("User deactivated");
          toast("Your account was deactivated. Please sign in again.");
          handleLogout();
          return;
        }
      } else {
        await fetchData();
      }

      toast.success("User deactivated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Deactivate user failed");
    } finally {
      setSaving(false);
    }
  };

  if (busy) return <Loader message="Preparing your dashboard..." />;
  if (hasError) {
    return (
      <div className="zf-content">
        <div className="zf-error">
          <span>{hasError}</span>
          <button className="zf-btn zf-btn-secondary" onClick={() => { fetchData(); fetchRecords(1, filterType, filterCategory, filterSearch, filterStartDate, filterEndDate, false, recordsPerPage); }}>Retry</button>
        </div>
      </div>
    );
  }

  // RBAC for actions
  const canManage = user?.role === "ADMIN";

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      <div className="zf-page-stack">
        {canViewAnalytics && (
          <div className="zf-dashboard-toggle" aria-label="Dashboard mode switcher">
            <span className="zf-dashboard-toggle__label">Dashboard Mode</span>
            <div className="zf-dashboard-toggle__group" role="tablist" aria-label="Dashboard mode">
              <button
                type="button"
                role="tab"
                aria-selected={dashboardMode === "summary"}
                className={`zf-dashboard-toggle__button ${dashboardMode === "summary" ? "is-active" : ""}`}
                onClick={() => setDashboardMode("summary")}
              >
                Summary
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={dashboardMode === "analytics"}
                className={`zf-dashboard-toggle__button ${dashboardMode === "analytics" ? "is-active" : ""}`}
                onClick={() => setDashboardMode("analytics")}
              >
                Analytics
              </button>
            </div>
          </div>
        )}

        {/* 1. Summary or Analytics (based on dashboard mode) */}
        <Suspense fallback={<Loader message="Loading analytics..." />}>
          <AnalyticsSection
            summary={summary}
            categories={categories}
            trends={trends}
            last7DaysTrends={last7DaysTrends}
            records={records}
            currentRole={user?.role}
            mode={dashboardMode}
            showModeToggle={false}
            showAccessRestricted={user?.role === "VIEWER"}
          />
        </Suspense>

        {/* 2. Records Table (Full Width) */}
        <section className="zf-section" id="records">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="zf-section__title mb-0">Records Management</h2>
            {canManage && (
              <button
                type="button"
                onClick={() => setEditRecord({})}
                disabled={saving}
                className="zf-btn zf-btn-success"
              >
                + Add Record
              </button>
            )}
          </div>
          <RecordsFilters
            filterType={inputType}
            filterCategory={inputCategory}
            filterSearch={inputSearch}
            filterStartDate={inputStartDate}
            filterEndDate={inputEndDate}
            onTypeChange={setInputType}
            onCategoryChange={setInputCategory}
            onSearchChange={setInputSearch}
            onStartDateChange={setInputStartDate}
            onEndDateChange={setInputEndDate}
            onSubmit={handleApplyFilters}
            disabled={recordsLoading || saving}
          />
          <RecordsTable
            records={records}
            showActions={canManage}
            onDelete={handleDeleteRecord}
            onEdit={handleEditRecord}
            busy={recordsLoading || saving}
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

        {/* 3. Audit Log (Full Width) */}
        <AuditLog records={records} />

        {/* 4. User Management (Full Width) - ADMIN ONLY */}
        {user?.role === "ADMIN" && (
          <UsersManagementTable
            users={users}
            onToggleStatus={handleToggleUserStatus}
            onChangeRole={handleChangeUserRole}
            onCreateUser={handleCreateUser}
            onDeactivateUser={handleDeactivateUser}
            canManage={canManage}
            busy={saving}
          />
        )}

        {/* 5. Live API Logs (Full Width Terminal Style) */}
        <LiveApiConsole
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
    </MainLayout>
  );
}
