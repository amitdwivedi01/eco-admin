import { apiGet } from "./api";

export function getVisitorRegistrations({
  page = 1,
  limit = 10,
  search = "",
  industryType = "",
  country = "",
  qrGenerated = "",
  confirmationEmailSent = "",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search.trim()) params.set("search", search.trim());
  if (industryType) params.set("industryType", industryType);
  if (country) params.set("country", country);
  if (qrGenerated !== "") params.set("qrGenerated", qrGenerated);

  if (confirmationEmailSent !== "") {
    params.set("confirmationEmailSent", confirmationEmailSent);
  }

  return apiGet(`/api/visitors?${params.toString()}`);
}

export async function sendVisitorRegistrationEmail(id) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/visitors/${id}/send-email`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Failed to resend visitor registration email",
    );
  }

  return result;
}
