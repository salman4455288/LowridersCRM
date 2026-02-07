import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Customer {
  id: string
  user_id: string
  name: string
  email?: string | null
  phone: string
  address: string
  lat: number
  lng: number
  status: 'Active' | 'Pending' | 'Inactive'
  plan_type?: 'Monthly' | 'Yearly' | 'Lifetime'
  offered_amount?: number
  last_interaction: string
  created_at: string
  updated_at: string
}

export interface Sale {
  id: string
  user_id: string
  customer_id: string
  customer_name: string
  amount: number
  status: 'In Progress' | 'Completed' | 'Pending'
  description: string
  contributors: string[]
  date: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  customer_id: string
  customer_name: string
  title: string
  due_date: string
  completed: boolean
  created_at: string
  updated_at: string
}

export interface Interaction {
  id: string
  customer_id: string
  user_id: string
  type: 'call' | 'message' | 'meeting' | 'note'
  content: string
  date: string
  created_at: string
}

export interface Note {
  id: string
  customer_id: string
  user_id: string
  content: string
  created_at: string
}

export interface Activity {
  id: string
  user_id: string
  type: 'sale' | 'customer' | 'interaction' | 'task'
  content: string
  date: string
}
