import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase, Customer, Sale, Task, Activity, Interaction, Note } from '@/lib/supabase'
import { useAuth } from './AuthContext'
import { toast } from 'sonner'

interface CRMContextType {
  customers: Customer[]
  sales: Sale[]
  tasks: Task[]
  activities: Activity[]
  profiles: { id: string, full_name: string | null, email: string | null }[]
  loading: boolean
  refreshData: () => Promise<void>
  addCustomer: (customer: Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Customer | null>
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>
  deleteCustomer: (id: string) => Promise<void>
  addSale: (sale: Omit<Sale, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateSale: (id: string, updates: Partial<Sale>) => Promise<void>
  deleteSale: (id: string) => Promise<void>
  addTask: (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  addInteraction: (customerId: string, interaction: Omit<Interaction, 'id' | 'user_id' | 'customer_id' | 'created_at'>) => Promise<void>
  addNote: (customerId: string, content: string) => Promise<void>
  getCustomerInteractions: (customerId: string) => Promise<Interaction[]>
  getCustomerNotes: (customerId: string) => Promise<Note[]>
}

const CRMContext = createContext<CRMContextType | undefined>(undefined)

export function CRMProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [profiles, setProfiles] = useState<{ id: string, full_name: string | null, email: string | null }[]>([])
  const [loading, setLoading] = useState(false)

  const refreshData = async () => {
    if (!user) return

    setLoading(true)
    try {
      const results = await Promise.all([
        supabase.from('customers').select('*').order('created_at', { ascending: false }),
        supabase.from('sales').select('*').order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').order('due_date', { ascending: true }),
        supabase.from('activities').select('*').order('date', { ascending: false }).limit(20),
        supabase.from('profiles').select('*'),
      ])

      const [customersData, salesData, tasksData, activitiesData, profilesData] = results

      if (customersData.error) throw customersData.error
      if (salesData.error) throw salesData.error
      if (tasksData.error) throw tasksData.error
      if (activitiesData.error) throw activitiesData.error
      if (profilesData.error) throw profilesData.error

      setCustomers(customersData.data || [])
      setSales(salesData.data || [])
      setTasks(tasksData.data || [])
      setActivities(activitiesData.data || [])
      setProfiles(profilesData.data || [])
    } catch (error: any) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshData()
  }, [user])

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Customer | null> => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([{ ...customerData, user_id: user.id }])
        .select()
        .single()

      if (error) throw error

      setCustomers([data, ...customers])

      // Add activity
      await supabase.from('activities').insert([{
        user_id: user.id,
        type: 'customer',
        content: `New customer added: ${customerData.name}`,
      }])

      await refreshData()
      toast.success('Customer added successfully')
      return data
    } catch (error: any) {
      console.error('Error adding customer:', error)

      // Check for missing column error (Postgres code 42703 or message text)
      if (error.code === '42703' || error.message?.includes('column') || error.message?.includes('does not exist')) {
        try {
          toast.info("Attempting fallback insert (schema might be outdated)...")
          // Create a fallback object with only core fields that definitely exist
          // We cast to any to avoid strict type checking for this fallback attempt
          const coreData: any = {
            name: customerData.name,
            phone: customerData.phone,
            address: customerData.address,
            status: customerData.status,
            email: customerData.email, // Include email, it's usually standard
            user_id: user.id
          }

          const { data: retryData, error: retryError } = await supabase
            .from('customers')
            .insert([coreData])
            .select()
            .single()

          if (retryError) throw retryError

          setCustomers([retryData, ...customers])
          await refreshData()
          toast.warning('Customer added, but extended fields (plan/amount) were not saved. Please update your database schema.')
          return retryData
        } catch (retryErr: any) {
          console.error('Fallback failed:', retryErr)
          toast.error(`Failed to add customer: ${retryErr.message} (Hint: Check database schema)`)
        }
      } else {
        toast.error(`Failed to add customer: ${error.message} (Code: ${error.code})`)
      }
      throw error
    }
  }

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      setCustomers(customers.map(c => c.id === id ? { ...c, ...updates } : c))
      toast.success('Customer updated successfully')
    } catch (error: any) {
      console.error('Error updating customer:', error)
      toast.error('Failed to update customer')
      throw error
    }
  }

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)

      if (error) throw error

      setCustomers(customers.filter(c => c.id !== id))
      toast.success('Customer deleted successfully')
    } catch (error: any) {
      console.error('Error deleting customer:', error)
      toast.error('Failed to delete customer')
      throw error
    }
  }

  const addSale = async (saleData: Omit<Sale, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('sales')
        .insert([{ ...saleData, user_id: user.id }])
        .select()
        .single()

      if (error) throw error

      setSales([data, ...sales])

      // Add activity
      await supabase.from('activities').insert([{
        user_id: user.id,
        type: 'sale',
        content: `New sale with ${saleData.customer_name} - $${saleData.amount.toLocaleString()}`,
      }])

      await refreshData()
      toast.success('Sale added successfully')
    } catch (error: any) {
      console.error('Error adding sale:', error)
      toast.error('Failed to add sale')
      throw error
    }
  }

  const updateSale = async (id: string, updates: Partial<Sale>) => {
    try {
      const { error } = await supabase
        .from('sales')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      setSales(sales.map(s => s.id === id ? { ...s, ...updates } : s))
      toast.success('Sale updated successfully')
    } catch (error: any) {
      console.error('Error updating sale:', error)
      toast.error('Failed to update sale')
      throw error
    }
  }

  const deleteSale = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSales(sales.filter(s => s.id !== id))
      await refreshData() // Force refresh to verify persistence
      toast.success('Sale deleted successfully')
    } catch (error: any) {
      console.error('Error deleting sale:', error)
      toast.error(`Deletion failed: ${error.message || 'Check permissions'}`)
      throw error
    }
  }

  const addTask = async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...taskData, user_id: user.id }])
        .select()
        .single()

      if (error) throw error

      setTasks([...tasks, data])

      // Add activity
      await supabase.from('activities').insert([{
        user_id: user.id,
        type: 'task',
        content: `New task: ${taskData.title}`,
      }])

      await refreshData()
      toast.success('Task added successfully')
    } catch (error: any) {
      console.error('Error adding task:', error)
      toast.error('Failed to add task')
      throw error
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t))
      toast.success('Task updated successfully')
    } catch (error: any) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
      throw error
    }
  }

  const addInteraction = async (
    customerId: string,
    interactionData: Omit<Interaction, 'id' | 'user_id' | 'customer_id' | 'created_at'>
  ) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('interactions')
        .insert([{
          ...interactionData,
          customer_id: customerId,
          user_id: user.id,
        }])

      if (error) throw error

      // Update customer's last interaction
      await supabase
        .from('customers')
        .update({ last_interaction: interactionData.date })
        .eq('id', customerId)

      const customer = customers.find(c => c.id === customerId)
      if (customer) {
        await supabase.from('activities').insert([{
          user_id: user.id,
          type: 'interaction',
          content: `${interactionData.type} with ${customer.name}`,
        }])
      }

      await refreshData()
      toast.success('Interaction added successfully')
    } catch (error: any) {
      console.error('Error adding interaction:', error)
      toast.error('Failed to add interaction')
      throw error
    }
  }

  const addNote = async (customerId: string, content: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('notes')
        .insert([{
          customer_id: customerId,
          user_id: user.id,
          content,
        }])

      if (error) throw error

      toast.success('Note added successfully')
    } catch (error: any) {
      console.error('Error adding note:', error)
      toast.error('Failed to add note')
      throw error
    }
  }

  const getCustomerInteractions = async (customerId: string): Promise<Interaction[]> => {
    try {
      const { data, error } = await supabase
        .from('interactions')
        .select('*')
        .eq('customer_id', customerId)
        .order('date', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching interactions:', error)
      return []
    }
  }

  const getCustomerNotes = async (customerId: string): Promise<Note[]> => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching notes:', error)
      return []
    }
  }

  return (
    <CRMContext.Provider
      value={{
        customers,
        sales,
        tasks,
        activities,
        profiles,
        loading,
        refreshData,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addSale,
        updateSale,
        deleteSale,
        addTask,
        updateTask,
        addInteraction,
        addNote,
        getCustomerInteractions,
        getCustomerNotes,
      }}
    >
      {children}
    </CRMContext.Provider>
  )
}

export function useCRM() {
  const context = useContext(CRMContext)
  if (context === undefined) {
    throw new Error('useCRM must be used within a CRMProvider')
  }
  return context
}
