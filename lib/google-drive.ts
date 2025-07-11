import { google } from 'googleapis'

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  'http://localhost:3000'
)

oauth2Client.setCredentials({
  refresh_token: REFRESH_TOKEN,
})

const drive = google.drive({ version: 'v3', auth: oauth2Client })

export async function uploadToGoogleDrive(
  filename: string,
  content: string,
  mimeType: string = 'application/json'
) {
  try {
    const fileMetadata = {
      name: filename,
      parents: ['your-folder-id'], // Create a folder in Google Drive and put its ID here
    }

    const media = {
      mimeType,
      body: content,
    }

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id',
    })

    return response.data.id
  } catch (error) {
    console.error('Error uploading to Google Drive:', error)
    throw error
  }
}

export async function downloadFromGoogleDrive(fileId: string) {
  try {
    const response = await drive.files.get({
      fileId,
      alt: 'media',
    })

    return response.data
  } catch (error) {
    console.error('Error downloading from Google Drive:', error)
    throw error
  }
}

export async function listGoogleDriveBackups() {
  try {
    const response = await drive.files.list({
      q: "parents in 'your-folder-id' and name contains 'family-accounting-backup'",
      fields: 'files(id, name, createdTime, size)',
      orderBy: 'createdTime desc',
    })

    return response.data.files
  } catch (error) {
    console.error('Error listing Google Drive backups:', error)
    throw error
  }
}

export async function createBackup(userId: string) {
  try {
    // Get all user data
    const [accounts, transactions, budgets] = await Promise.all([
      prisma.account.findMany({ where: { userId } }),
      prisma.transaction.findMany({
        where: { userId },
        include: { splits: true },
      }),
      prisma.budget.findMany({
        where: { userId },
        include: { items: true },
      }),
    ])

    const backupData = {
      timestamp: new Date().toISOString(),
      userId,
      accounts,
      transactions,
      budgets,
    }

    const filename = `family-accounting-backup-${new Date().toISOString().split('T')[0]}.json`
    const content = JSON.stringify(backupData, null, 2)

    const fileId = await uploadToGoogleDrive(filename, content)
    return { fileId, filename }
  } catch (error) {
    console.error('Error creating backup:', error)
    throw error
  }
}

//