"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import { VirtualCard } from "~~/hooks/scaffold-eth/useVirtualCards";

interface EditVirtualCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateCard: (data: { cardName: string; spendingLimit: number }) => void;
  card?: VirtualCard;
}

export const EditVirtualCardModal = ({ isOpen, onClose, onUpdateCard, card }: EditVirtualCardModalProps) => {
  const [formData, setFormData] = useState({
    cardName: "",
    spendingLimit: 1000,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (card) {
      setFormData({
        cardName: card.cardName,
        spendingLimit: Number(card.spendingLimit) / 100,
      });
    }
  }, [card]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onUpdateCard(formData);
    } catch (error) {
      console.error("Error updating card:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={onClose}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 sm:mx-0 sm:h-10 sm:w-10">
              <CreditCardIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Edit Virtual Card
              </h3>
              <div className="mt-2">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">
                      Card Name
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      id="cardName"
                      value={formData.cardName}
                      onChange={(e) => setFormData({...formData, cardName: e.target.value})}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                      placeholder="e.g., Shopping Card"
                    />
                  </div>

                  <div>
                    <label htmlFor="spendingLimit" className="block text-sm font-medium text-gray-700">
                      Spending Limit (₵)
                    </label>
                    <input
                      type="number"
                      name="spendingLimit"
                      id="spendingLimit"
                      value={formData.spendingLimit}
                      onChange={(e) => setFormData({...formData, spendingLimit: Number(e.target.value)})}
                      required
                      min="1"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                    />
                  </div>

                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex w-full justify-center rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 sm:ml-3 sm:w-auto disabled:opacity-50"
                    >
                      {isSubmitting ? "Updating..." : "Update Card"}
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
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
    </div>
  );
};