import { useState, useMemo } from 'react'
import { useCRM } from '@/contexts/CRMContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Plus, Mail, Phone, MapPin, Search,
  MessageCircle, Edit2, Trash2, Calendar,
  Check, X
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, addTask, loading } = useCRM()
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [schedulingId, setSchedulingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    lat: 0,
    lng: 0,
    status: 'Active' as const,
    last_interaction: new Date().toISOString(),
  })

  const [editFormData, setEditFormData] = useState<any>(null)
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    due_date: new Date().toISOString().split('T')[0],
  })

  const filteredCustomers = useMemo(() => {
    return customers.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery)
    )
  }, [customers, searchQuery])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addCustomer(formData)
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        lat: 0,
        lng: 0,
        status: 'Active',
        last_interaction: new Date().toISOString(),
      })
      setShowAddForm(false)
    } catch (error) {
      console.error('Error adding customer:', error)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return
    try {
      await updateCustomer(editingId, editFormData)
      setEditingId(null)
      setEditFormData(null)
    } catch (error) {
      console.error('Error updating customer:', error)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      try {
        await deleteCustomer(id)
      } catch (error) {
        console.error('Error deleting customer:', error)
      }
    }
  }

  const handleScheduleTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!schedulingId) return
    const customer = customers.find(c => c.id === schedulingId)
    if (!customer) return

    try {
      await addTask({
        customer_id: customer.id,
        customer_name: customer.name,
        title: taskFormData.title,
        due_date: taskFormData.due_date,
        completed: false,
      })
      setSchedulingId(null)
      setTaskFormData({
        title: '',
        due_date: new Date().toISOString().split('T')[0],
      })
      toast.success(`Follow-up scheduled for ${customer.name}`)
    } catch (error) {
      console.error('Error scheduling task:', error)
    }
  }

  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '')
    window.open(`https://wa.me/${cleanPhone}`, '_blank')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads & Customers</h1>
          <p className="text-gray-500 mt-1">Manage and follow up with your 100+ leads</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or phone..."
              className="pl-9 w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {showAddForm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Add New Lead</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (with country code)</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    placeholder="e.g. 923001234567"
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="Active">Active (Contacted)</option>
                    <option value="Pending">Pending (New Lead)</option>
                    <option value="Inactive">Inactive (Not Interested)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address / Notes</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Lead</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className={`group relative hover:shadow-xl transition-all duration-300 border-l-4 ${customer.status === 'Active' ? 'border-l-green-500' :
                customer.status === 'Pending' ? 'border-l-yellow-500' : 'border-l-gray-300'
              }`}>
              {editingId === customer.id ? (
                <CardContent className="pt-6">
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={editFormData?.name}
                        onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={editFormData?.phone}
                        onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                        value={editFormData?.status}
                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                      >
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" type="submit"><Check className="h-4 w-4 mr-1" /> Save</Button>
                      <Button size="sm" variant="ghost" type="button" onClick={() => setEditingId(null)}><X className="h-4 w-4 mr-1" /> Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              ) : schedulingId === customer.id ? (
                <CardContent className="pt-6">
                  <form onSubmit={handleScheduleTask} className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">Schedule Follow-up</h3>
                      <Button size="icon" variant="ghost" onClick={() => setSchedulingId(null)}><X className="h-4 w-4" /></Button>
                    </div>
                    <div className="space-y-2">
                      <Label>Task / Meeting Title</Label>
                      <Input
                        placeholder="e.g. Follow-up meeting"
                        value={taskFormData.title}
                        onChange={e => setTaskFormData({ ...taskFormData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={taskFormData.due_date}
                        onChange={e => setTaskFormData({ ...taskFormData, due_date: e.target.value })}
                        required
                      />
                    </div>
                    <Button size="sm" className="w-full" type="submit">Schedule</Button>
                  </form>
                </CardContent>
              ) : (
                <>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl font-bold">{customer.name}</CardTitle>
                        <div className="flex gap-2">
                          <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full ${customer.status === 'Active' ? 'bg-green-100 text-green-700' :
                              customer.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                            {customer.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => {
                            setEditingId(customer.id)
                            setEditFormData(customer)
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(customer.id, customer.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {customer.phone && (
                        <div className="flex items-center justify-between group/row">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4 text-primary" />
                            {customer.phone}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 bg-green-50 text-green-700 hover:bg-green-100 border-none px-2"
                            onClick={() => openWhatsApp(customer.phone)}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            WhatsApp
                          </Button>
                        </div>
                      )}
                      {customer.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4 text-primary" />
                          {customer.email}
                        </div>
                      )}
                      {customer.address && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="truncate">{customer.address}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="text-xs text-gray-400">
                        {customer.last_interaction ? (
                          <>Last contact: {formatDate(customer.last_interaction)}</>
                        ) : (
                          <>No recent contact</>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-primary border-primary/20 hover:bg-primary/5 px-2"
                        onClick={() => setSchedulingId(customer.id)}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Schedule
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredCustomers.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Search className="h-12 w-12 text-gray-200 mb-4" />
            <p className="text-gray-500 mb-4">
              {searchQuery ? `No leads found matching "${searchQuery}"` : "No leads yet"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Lead
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
