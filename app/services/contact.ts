import api from './api'

export interface ContactFormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  message: string
  subject?: string
}

/**
 * Submit a contact form
 */
export async function submitContactForm(data: ContactFormData): Promise<any> {
  try {
    const response = await api.post('/contact-form-submissions', {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      subject: data.subject || 'Contact Form Submission',
    })
    return response.data
  } catch (error) {
    console.error('Error submitting contact form:', error)
    throw error
  }
}

