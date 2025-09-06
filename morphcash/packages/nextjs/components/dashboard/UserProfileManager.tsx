"use client";

import { useState } from "react";
import { useEnhancedAuth } from "~~/contexts/EnhancedAuthContext";
import { useAccount } from "wagmi";
import { 
  UserIcon, 
  PencilIcon
} from "@heroicons/react/24/outline";
import { ENSProfileForm } from "./ENSProfileForm";

export const UserProfileManager = () => {
  const { user } = useEnhancedAuth();
  const { address } = useAccount();
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  return (
    <div className="space-y-6">
      {/* Profile Content */}
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  {user?.ensProfile?.avatar ? (
                    <img
                      src={user.ensProfile.avatar}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-8 w-8 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {user?.ens_profile?.displayName || user?.ens_name || user?.email || 'User'}
                  </h2>
                  <p className="text-gray-600">
                    {user?.ens_name && `@${user.ens_name}`}
                    {user?.email && ` • ${user.email}`}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    {user?.auth_method?.toUpperCase()} Authentication
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingProfile(true)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Display Name</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user?.ensProfile?.displayName || 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user?.ensProfile?.bio || 'No bio available'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Website</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user?.ensProfile?.website ? (
                      <a 
                        href={user.ensProfile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700"
                      >
                        {user.ensProfile.website}
                      </a>
                    ) : (
                      'Not set'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Twitter</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user?.ensProfile?.twitter ? (
                      <a 
                        href={`https://twitter.com/${user.ensProfile.twitter.replace('@', '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700"
                      >
                        {user.ensProfile.twitter}
                      </a>
                    ) : (
                      'Not set'
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">GitHub</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user?.ensProfile?.github ? (
                      <a 
                        href={`https://github.com/${user.ensProfile.github}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700"
                      >
                        @{user.ensProfile.github}
                      </a>
                    ) : (
                      'Not set'
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Discord</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user?.ensProfile?.discord || 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telegram</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user?.ensProfile?.telegram ? (
                      <a 
                        href={`https://t.me/${user.ensProfile.telegram.replace('@', '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700"
                      >
                        {user.ensProfile.telegram}
                      </a>
                    ) : (
                      'Not set'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ENS Profile Form Modal */}
          {isEditingProfile && (
            <ENSProfileForm
              isOpen={isEditingProfile}
              onClose={() => setIsEditingProfile(false)}
              initialData={user?.ensProfile}
            />
          )}
        </div>
    </div>
  );
};
