// === Function ===
export async function getMicrosoftGraphToken({
  tenantId,
  clientId,
  clientSecret
}: {
  tenantId: string;
  clientId: string;
  clientSecret: string;
}): Promise<string> {
  const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://graph.microsoft.com/.default'
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.error_description || 'Failed to fetch Microsoft Graph token');

  return data.access_token;
}
