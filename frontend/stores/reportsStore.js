import { create } from "zustand";
import { getAuthToken } from "../utils/getAuthToken";

export const useReportsStore = create((set, get) => ({
  reporting: false,
  reportedMap: {},

  fetchUserReports: async (userId) => {
    const token = await getAuthToken();
    if (!token) {
      return;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reports/user`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    if (Array.isArray(data)) {
      const map = {};
      data.forEach(r => {
        map[r.target_id] = true;
      });
      set({ reportedMap: map });
    }
  },


  submitReport: async ({ targetId, type, reason, reasonCode }) => {
    const token = await getAuthToken();
    if (!token) {
      return;
    }

    set({ reporting: true });

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reports/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          target_id: targetId,
          type,
          reason,
          reason_code: reasonCode,
        }),
      }
    );

    const data = await res.json();
    set({ reporting: false });

    if (!res.ok) {
      return {
        error: data.error || "Report failed",
        status: res.status,
      };
    }

    set(state => ({
      reportedMap: {
        ...state.reportedMap,
        [targetId]: true,
      },
    }));

    return {
      success: true,
      data,
    };
  }
}));
