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
