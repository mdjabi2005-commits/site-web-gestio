// Frontend API - Attachments
// Stockage des pièces jointes via IndexedDB (base64)

export interface Attachment {
    id: number
    transaction_id: number
    file_name: string
    file_path: string
    file_type: string
    upload_date: string | null
}

export async function getAttachments(_transactionId: number): Promise<Attachment[]> {
    return []
}

export async function deleteAttachment(_attachmentId: number): Promise<boolean> {
    return true
}
