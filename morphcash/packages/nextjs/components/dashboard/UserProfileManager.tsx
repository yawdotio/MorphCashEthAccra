"use client";

import { useState } from "react";
import { ENSProfileForm } from "./ENSProfileForm";
import { PencilIcon, UserIcon } from "@heroicons/react/24/outline";
import { useAuth } from "~~/contexts/AuthContext";

export const UserProfileManager = () => {
  const { user } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  return (
    <div className="space-y-6">
      {/* Profile Content */}
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="bg-base-100 rounded-lg border border-base-300 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                {user?.ensProfile?.avatar ? (
                  <img src={user.ensProfile.avatar} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <UserIcon className="h-8 w-8 text-primary-content" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-base-content">
                  {user?.displayName || user?.ensProfile?.displayName || user?.ensName || user?.email || "User"}
                </h2>
                <p className="text-base-content/70">
                  {user?.ensName && `@${user.ensName}`}
                  {user?.email && ` • ${user.email}`}
                </p>
                <p className="text-sm text-base-content/60 capitalize">
                  {user?.accountType} Package • {user?.authMethod?.toUpperCase()} Authentication
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditingProfile(true)}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-content rounded-lg hover:bg-primary/90 transition-colors"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="bg-base-100 rounded-lg border border-base-300 p-6">
            <h3 className="text-lg font-semibold text-base-content mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-base-content">Display Name</label>
                <p className="mt-1 text-sm text-base-content">{user?.ensProfile?.displayName || "Not set"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content">Bio</label>
                <p className="mt-1 text-sm text-base-content">{user?.ensProfile?.bio || "No bio available"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content">Website</label>
                <p className="mt-1 text-sm text-base-content">
                  {user?.ensProfile?.website ? (
                    <a
                      href={user.ensProfile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                    >
                      {user.ensProfile.website}
                    </a>
                  ) : (
                    "Not set"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-base-100 rounded-lg border border-base-300 p-6">
            <h3 className="text-lg font-semibold text-base-content mb-4">Social Links</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-base-content">Twitter</label>
                <p className="mt-1 text-sm text-base-content">
                  {user?.ensProfile?.twitter ? (
                    <a
                      href={`https://twitter.com/${user.ensProfile.twitter.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                    >
                      {user.ensProfile.twitter}
                    </a>
                  ) : (
                    "Not set"
                  )}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content">GitHub</label>
                <p className="mt-1 text-sm text-base-content">
                  {user?.ensProfile?.github ? (
                    <a
                      href={`https://github.com/${user.ensProfile.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                    >
                      @{user.ensProfile.github}
                    </a>
                  ) : (
                    "Not set"
                  )}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content">Discord</label>
                <p className="mt-1 text-sm text-base-content">{user?.ensProfile?.discord || "Not set"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content">Telegram</label>
                <p className="mt-1 text-sm text-base-content">
                  {user?.ensProfile?.telegram ? (
                    <a
                      href={`https://t.me/${user.ensProfile.telegram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                    >
                      {user.ensProfile.telegram}
                    </a>
                  ) : (
                    "Not set"
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
