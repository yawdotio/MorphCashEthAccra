import type { NextPage } from "next";
import { DashboardLayout } from "~~/components/dashboard/DashboardLayout";
import { Overview } from "~~/components/dashboard/Overview";
import { ProtectedRoute } from "~~/components/auth";

const Dashboard: NextPage = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Overview />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Dashboard;
