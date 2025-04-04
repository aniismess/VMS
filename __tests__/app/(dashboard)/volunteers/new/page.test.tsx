import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewVolunteerPage from '@/app/(dashboard)/volunteers/new/page'
import { createVolunteerInDb } from '@/lib/supabase-service'
import { useRouter } from 'next/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock supabase-service
jest.mock('@/lib/supabase-service', () => ({
  createVolunteerInDb: jest.fn(),
}))

describe('NewVolunteerPage', () => {
  const mockRouter = {
    push: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('renders the form with all required fields', () => {
    render(<NewVolunteerPage />)

    expect(screen.getByLabelText(/sai connect id/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mobile number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/aadhar number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/sss district/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/gender/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/samiti/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/education/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/special qualifications/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/sevadal training certificate/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/past prashanti service/i)).toBeInTheDocument()
  })

  it('validates SAI Connect ID format', async () => {
    render(<NewVolunteerPage />)

    const saiConnectInput = screen.getByLabelText(/sai connect id/i)
    await userEvent.type(saiConnectInput, '12345') // Less than 6 digits
    expect(saiConnectInput).toHaveValue('12345')

    await userEvent.type(saiConnectInput, '6') // Add one more digit
    expect(saiConnectInput).toHaveValue('123456')
  })

  it('validates mobile number format', async () => {
    render(<NewVolunteerPage />)

    const mobileInput = screen.getByLabelText(/mobile number/i)
    await userEvent.type(mobileInput, '123456789') // Less than 10 digits
    expect(mobileInput).toHaveValue('123456789')

    await userEvent.type(mobileInput, '0') // Add one more digit
    expect(mobileInput).toHaveValue('1234567890')
  })

  it('validates Aadhar number format', async () => {
    render(<NewVolunteerPage />)

    const aadharInput = screen.getByLabelText(/aadhar number/i)
    await userEvent.type(aadharInput, '123456789012') // 12 digits
    expect(aadharInput).toHaveValue('123456789012')
  })

  it('validates age input', async () => {
    render(<NewVolunteerPage />)

    const ageInput = screen.getByLabelText(/age/i)
    await userEvent.type(ageInput, '150') // Invalid age
    expect(ageInput).toHaveValue('15') // Should be truncated to 2 digits
  })

  it('handles successful volunteer creation', async () => {
    ;(createVolunteerInDb as jest.Mock).mockResolvedValue(undefined)

    render(<NewVolunteerPage />)

    // Fill in required fields
    await userEvent.type(screen.getByLabelText(/sai connect id/i), '123456')
    await userEvent.type(screen.getByLabelText(/full name/i), 'Test Volunteer')
    await userEvent.type(screen.getByLabelText(/age/i), '25')
    await userEvent.type(screen.getByLabelText(/mobile number/i), '1234567890')
    await userEvent.type(screen.getByLabelText(/aadhar number/i), '123456789012')
    await userEvent.click(screen.getByLabelText(/sss district/i))
    await userEvent.click(screen.getByText(/bhopal/i))
    await userEvent.click(screen.getByLabelText(/gender/i))
    await userEvent.click(screen.getByText(/male/i))

    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: /create volunteer/i }))

    await waitFor(() => {
      expect(createVolunteerInDb).toHaveBeenCalledWith({
        sai_connect_id: '123456',
        full_name: 'Test Volunteer',
        age: 25,
        mobile_number: '1234567890',
        aadhar_number: '123456789012',
        sss_district: 'Bhopal',
        Gender: 'male',
        samiti_or_bhajan_mandli: '',
        education: '',
        special_qualifications: '',
        sevadal_training_certificate: false,
        past_prashanti_service: false,
        is_cancelled: false,
        serial_number: null,
        prashanti_arrival: null,
        prashanti_departure: null,
      })
      expect(mockRouter.push).toHaveBeenCalledWith('/volunteers')
    })
  })

  it('handles creation error', async () => {
    const error = new Error('Duplicate SAI Connect ID')
    ;(createVolunteerInDb as jest.Mock).mockRejectedValue(error)

    render(<NewVolunteerPage />)

    // Fill in required fields
    await userEvent.type(screen.getByLabelText(/sai connect id/i), '123456')
    await userEvent.type(screen.getByLabelText(/full name/i), 'Test Volunteer')
    await userEvent.type(screen.getByLabelText(/age/i), '25')
    await userEvent.type(screen.getByLabelText(/mobile number/i), '1234567890')
    await userEvent.type(screen.getByLabelText(/aadhar number/i), '123456789012')
    await userEvent.click(screen.getByLabelText(/sss district/i))
    await userEvent.click(screen.getByText(/bhopal/i))
    await userEvent.click(screen.getByLabelText(/gender/i))
    await userEvent.click(screen.getByText(/male/i))

    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: /create volunteer/i }))

    await waitFor(() => {
      expect(screen.getByText(/failed to create volunteer/i)).toBeInTheDocument()
    })
  })

  it('validates required fields', async () => {
    render(<NewVolunteerPage />)

    // Try to submit without filling required fields
    await userEvent.click(screen.getByRole('button', { name: /create volunteer/i }))

    expect(screen.getByLabelText(/sai connect id/i)).toBeInvalid()
    expect(screen.getByLabelText(/full name/i)).toBeInvalid()
  })

  it('shows loading state during submission', async () => {
    ;(createVolunteerInDb as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<NewVolunteerPage />)

    // Fill in required fields
    await userEvent.type(screen.getByLabelText(/sai connect id/i), '123456')
    await userEvent.type(screen.getByLabelText(/full name/i), 'Test Volunteer')
    await userEvent.type(screen.getByLabelText(/age/i), '25')
    await userEvent.type(screen.getByLabelText(/mobile number/i), '1234567890')
    await userEvent.type(screen.getByLabelText(/aadhar number/i), '123456789012')
    await userEvent.click(screen.getByLabelText(/sss district/i))
    await userEvent.click(screen.getByText(/bhopal/i))
    await userEvent.click(screen.getByLabelText(/gender/i))
    await userEvent.click(screen.getByText(/male/i))

    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: /create volunteer/i }))

    expect(screen.getByText(/submitting/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByText(/submitting/i)).not.toBeInTheDocument()
    })
  })
}) 