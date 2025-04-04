// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  useSession: () => ({
    data: {
      user: {
        email: 'test@example.com',
        name: 'Test User',
      },
    },
    status: 'authenticated',
  }),
}))

// Mock @/lib/supabase
const mockSupabaseSelect = jest.fn().mockResolvedValue({ data: [], count: 0 })
const mockSupabaseFrom = jest.fn(() => ({
  select: mockSupabaseSelect,
  insert: jest.fn().mockResolvedValue({ data: null, error: null }),
  update: jest.fn().mockResolvedValue({ data: null, error: null }),
  delete: jest.fn().mockResolvedValue({ data: null, error: null }),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: null, error: null }),
}))

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: mockSupabaseFrom,
    auth: {
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
  },
}))

// Export mock functions for test files to use
export { mockSupabaseSelect, mockSupabaseFrom }

// Mock xlsx
jest.mock('xlsx', () => ({
  read: jest.fn(),
  utils: {
    sheet_to_json: jest.fn(),
  },
}))

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
}))

// Suppress console.error in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
}) 