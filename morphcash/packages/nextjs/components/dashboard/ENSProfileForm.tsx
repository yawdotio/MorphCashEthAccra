"use client";

import { useEffect, useState } from "react";
import { UserIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "~~/contexts/AuthContext";

interface ENSProfileFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    displayName: string;
    bio: string;
    avatar: string;
    website: string;
    twitter: string;
    github: string;
    discord: string;
    telegram: string;
  };
}

export const ENSProfileForm = ({ isOpen, onClose, initialData }: ENSProfileFormProps) => {
  const { user, createENSProfile, updateENSProfile, updateDisplayName } = useAuth();
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    avatar: "",
    website: "",
    twitter: "",
    github: "",
    discord: "",
    telegram: "",
  });
  const [userDisplayName, setUserDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
    if (user?.displayName) {
      setUserDisplayName(user.displayName);
    }
  }, [initialData, user?.displayName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Update user display name if it changed
      if (userDisplayName && userDisplayName !== user?.displayName) {
        await updateDisplayName(userDisplayName);
      }

      if (user?.ensName) {
        if (initialData) {
          // Update existing profile
          await updateENSProfile(user.ensName, formData);
        } else {
          // Create new profile
          await createENSProfile(user.ensName, formData);
        }
      }
      onClose();
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-base-content/50 transition-opacity" onClick={onClose} />

        <div className="relative transform overflow-hidden rounded-lg bg-base-100 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className="rounded-md bg-base-100 text-base-content/50 hover:text-base-content focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              onClick={onClose}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 sm:mx-0 sm:h-10 sm:w-10">
              <UserIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-medium leading-6 text-base-content">
                {initialData ? "Edit Profile" : "Create ENS Profile"}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-base-content/70">
                  {initialData
                    ? "Update your ENS profile information."
                    : "Create your ENS profile to showcase your identity."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-base-content">Basic Information</h4>

                  <div>
                    <label htmlFor="userDisplayName" className="block text-sm font-medium text-base-content">
                      Your Display Name
                    </label>
                    <input
                      type="text"
                      name="userDisplayName"
                      id="userDisplayName"
                      value={userDisplayName}
                      onChange={e => setUserDisplayName(e.target.value)}
                      className="mt-1 block w-full h-12 px-3 rounded-md border-base-300 bg-base-100 text-base-content shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                      placeholder="Your display name (shows instead of email)"
                    />
                    <p className="mt-1 text-xs text-base-content/70">
                      This name will be displayed throughout the app instead of your email address
                    </p>
                  </div>

                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-base-content">
                      ENS Profile Display Name
                    </label>
                    <input
                      type="text"
                      name="displayName"
                      id="displayName"
                      value={formData.displayName}
                      onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                      className="mt-1 block w-full h-12 px-3 rounded-md border-base-300 bg-base-100 text-base-content shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                      placeholder="Your display name"
                    />
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-base-content">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      id="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={e => setFormData({ ...formData, bio: e.target.value })}
                      className="mt-1 block w-full h-20 px-3 py-3 rounded-md border-base-300 bg-base-100 text-base-content shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                      placeholder="Tell us about yourself"
                    />
                  </div>

                  <div>
                    <label htmlFor="avatar" className="block text-sm font-medium text-base-content">
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      name="avatar"
                      id="avatar"
                      value={formData.avatar}
                      onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                      className="mt-1 block w-full h-12 px-3 rounded-md border-base-300 bg-base-100 text-base-content shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-base-content">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      id="website"
                      value={formData.website}
                      onChange={e => setFormData({ ...formData, website: e.target.value })}
                      className="mt-1 block w-full h-12 px-3 rounded-md border-base-300 bg-base-100 text-base-content shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-base-content">Social Links</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="twitter" className="block text-sm font-medium text-base-content">
                        Twitter
                      </label>
                      <input
                        type="text"
                        name="twitter"
                        id="twitter"
                        value={formData.twitter}
                        onChange={e => setFormData({ ...formData, twitter: e.target.value })}
                        className="mt-1 block w-full h-12 px-3 rounded-md border-base-300 bg-base-100 text-base-content shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                        placeholder="@username"
                      />
                    </div>

                    <div>
                      <label htmlFor="github" className="block text-sm font-medium text-base-content">
                        GitHub
                      </label>
                      <input
                        type="text"
                        name="github"
                        id="github"
                        value={formData.github}
                        onChange={e => setFormData({ ...formData, github: e.target.value })}
                        className="mt-1 block w-full h-12 px-3 rounded-md border-base-300 bg-base-100 text-base-content shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                        placeholder="username"
                      />
                    </div>

                    <div>
                      <label htmlFor="discord" className="block text-sm font-medium text-base-content">
                        Discord
                      </label>
                      <input
                        type="text"
                        name="discord"
                        id="discord"
                        value={formData.discord}
                        onChange={e => setFormData({ ...formData, discord: e.target.value })}
                        className="mt-1 block w-full h-12 px-3 rounded-md border-base-300 bg-base-100 text-base-content shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                        placeholder="username#1234"
                      />
                    </div>

                    <div>
                      <label htmlFor="telegram" className="block text-sm font-medium text-base-content">
                        Telegram
                      </label>
                      <input
                        type="text"
                        name="telegram"
                        id="telegram"
                        value={formData.telegram}
                        onChange={e => setFormData({ ...formData, telegram: e.target.value })}
                        className="mt-1 block w-full h-12 px-3 rounded-md border-base-300 bg-base-100 text-base-content shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                        placeholder="@username"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-base font-medium text-primary-content shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {isSubmitting ? "Saving..." : "Update Profile"}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-base-300 bg-base-100 px-4 py-2 text-base font-medium text-base-content shadow-sm hover:bg-base-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
