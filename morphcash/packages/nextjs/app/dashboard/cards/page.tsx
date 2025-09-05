import type { NextPage } from "next";
import { DashboardLayout } from "~~/components/dashboard/DashboardLayout";
import { ProtectedRoute } from "~~/components/auth";
import { VirtualCardsManager } from "~~/components/dashboard/VirtualCardsManager";

const Cards: NextPage = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Virtual Cards</h1>
          </div>
          
          <VirtualCardsManager />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Cards;
