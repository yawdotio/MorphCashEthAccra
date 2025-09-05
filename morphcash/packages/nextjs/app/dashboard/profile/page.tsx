import type { NextPage } from "next";
import { DashboardLayout } from "~~/components/dashboard/DashboardLayout";
import { ProtectedRoute } from "~~/components/auth";
import { UserProfileManager } from "~~/components/dashboard/UserProfileManager";

const Profile: NextPage = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Profile Management</h1>
          </div>
          
          <UserProfileManager />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Profile;
