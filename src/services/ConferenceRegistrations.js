const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function getConferenceRegistrations({
  page = 1,
  limit = 10,
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const response = await fetch(
    `${API_BASE_URL}/api/conference/registrations?${params.toString()}`,
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Failed to fetch conference registrations",
    );
  }

  return result;
}

export async function sendConferenceRegistrationEmail(registrationId, token) {
  const response = await fetch(
    `${API_BASE_URL}/api/conference/registrations/${registrationId}/send-email`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Failed to resend conference registration email",
    );
  }

  return result;
}
