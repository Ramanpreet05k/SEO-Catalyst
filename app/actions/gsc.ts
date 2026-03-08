// app/actions/gsc.ts
import { google } from 'googleapis';

export async function getRealGscData(siteUrl: string) {
  // 1. Authenticate with your Service Account JSON
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!),
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  const searchConsole = google.webmasters({ version: 'v3', auth });

  // 2. Fetch the last 30 days of data
  const response = await searchConsole.searchanalytics.query({
    siteUrl: siteUrl,
    requestBody: {
      startDate: '2023-09-01',
      endDate: '2023-10-01',
      dimensions: ['query', 'date'],
    },
  });

  return response.data.rows;
}