import { getAdminNotify } from "@/data/notification";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Notification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  timestamp: number;
  isRead: boolean;
}

// Store interface
interface NotificationStore {
  notifications: Notification[];
  initializeFromDatabase: (userId: string) => Promise<void>;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "isRead">,
  ) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
}

async function saveNotificationsToDatabase(
  userId: string,
  notifications: Notification[],
) {
  try {
    const response = await fetch("/api/notifications/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        notifications,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save notifications");
    }
  } catch (error) {
    console.error("Error saving notifications:", error);
  }
}

// Create Zustand store with persistence
export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],

  // Initialize notifications from database
  initializeFromDatabase: async (userId) => {
    try {
      let notify = await getAdminNotify();
      const currentArray: Notification[] = Array.isArray(notify)
        ? (notify as unknown as Notification[])
        : [];
      const reversedArray = [...currentArray].reverse();
      set({ notifications: reversedArray });
    } catch (error) {
      console.error("Error initializing notifications:", error);
    }
  },

  // Add a new notification
  addNotification: async (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      ...notification,
      timestamp: Date.now(),
      isRead: false,
    };

    const updatedNotifications = [...get().notifications, newNotification];
    const reversedArray = [...updatedNotifications].reverse();
    set({ notifications: reversedArray });

    // Save to database
    // await saveNotificationsToDatabase("current-user-id", updatedNotifications);
  },

  // Mark a notification as read
  markAsRead: async (id) => {
    const updatedNotifications = get().notifications.map((notification) =>
      notification.id === id ? { ...notification, isRead: true } : notification,
    );

    set({ notifications: updatedNotifications });

    // Save to database
    // await saveNotificationsToDatabase("current-user-id", updatedNotifications);
  },

  // Remove a specific notification
  removeNotification: async (id) => {
    const updatedNotifications = get().notifications.filter(
      (notification) => notification.id !== id,
    );

    set({ notifications: updatedNotifications });

    // Save to database
    // await saveNotificationsToDatabase("current-user-id", updatedNotifications);
  },

  // Clear all notifications
  clearNotifications: async () => {
    set({ notifications: [] });

    // Save to database
    // await saveNotificationsToDatabase("current-user-id", []);
  },
}));
