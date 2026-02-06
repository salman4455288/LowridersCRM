import { useState, useMemo } from 'react'
import { useCRM } from '@/contexts/CRMContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Plus, Mail, Phone, MapPin, Search,
  MessageCircle, Edit2, Trash2, Calendar,
  Check, X, Download, Upload, FileSpreadsheet, Kanban, LayoutGrid, ChevronDown
} from 'lucide-react'
import { formatDate, formatPKPhoneNumber } from '@/lib/utils'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, addTask, loading } = useCRM()
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [schedulingId, setSchedulingId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'kanban' | 'dayplan'>('grid')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    lat: 0,
    lng: 0,
    status: 'Pending' as const,
    plan_type: 'Monthly' as const,
    offered_amount: 2000,
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
      const formattedPhone = formatPKPhoneNumber(formData.phone)
      await addCustomer({ ...formData, phone: formattedPhone })
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        lat: 0,
        lng: 0,
        status: 'Pending',
        plan_type: 'Monthly',
        offered_amount: 2000,
        last_interaction: new Date().toISOString(),
      })
      setShowAddForm(false)
    } catch (error) {
      console.error('Error adding customer:', error)
    }
  }

  const exportToExcel = () => {
    const data = customers.map(c => ({
      Name: c.name,
      Email: c.email || '',
      Phone: c.phone || '',
      Status: c.status,
      Address: c.address || '',
      'Last Interaction': c.last_interaction ? formatDate(c.last_interaction) : 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Customers')
    XLSX.writeFile(wb, `CRM_Customers_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const downloadTemplate = () => {
    const template = [
      {
        Name: 'John Doe',
        Email: 'john@example.com',
        Phone: '03001234567',
        Status: 'Pending',
        Address: '123 Street, City',
        'Plan Type': 'Monthly',
        'Offered Amount': 2000
      }
    ]
    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Template')
    XLSX.writeFile(wb, 'Customer_Import_Template.xlsx')
  }

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws) as any[]

        let successCount = 0
        for (const row of data) {
          if (row.Name) {
            await addCustomer({
              name: row.Name,
              email: row.Email || '',
              phone: formatPKPhoneNumber(String(row.Phone || '')),
              status: row.Status || 'Pending',
              address: row.Address || '',
              plan_type: row['Plan Type'] || 'Monthly',
              offered_amount: Number(row['Offered Amount']) || 2000,
              lat: 0,
              lng: 0,
              last_interaction: new Date().toISOString()
            })
            successCount++
          }
        }
        toast.success(`Successfully imported ${successCount} customers`)
      } catch (error) {
        console.error('Import error:', error)
        toast.error('Failed to import Excel file')
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return
    try {
      const formattedPhone = formatPKPhoneNumber(editFormData.phone)
      await updateCustomer(editingId, { ...editFormData, phone: formattedPhone })
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

  const whatsappTemplates = [
    { name: 'Welcome', text: 'Hello! Welcome to our CRM. How can we help you today?' },
    { name: 'Follow-up', text: 'Hi! Just following up on our last conversation. Any updates?' },
    { name: 'Meeting', text: 'Hey! Are you available for a quick meeting tomorrow?' },
    { name: 'Payment', text: 'Hi! This is a friendly reminder regarding the outstanding payment.' },
  ]

  const sendWhatsAppTemplate = (phone: string, templateText: string) => {
    const cleanPhone = phone.replace(/\D/g, '')
    const encodedText = encodeURIComponent(templateText)
    window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, '_blank')
  }

  const kanbanColumns = [
    { id: 'Pending', name: 'New Leads', color: 'bg-yellow-500' },
    { id: 'Active', name: 'Contacted', color: 'bg-green-500' },
    { id: 'Inactive', name: 'Not Interested', color: 'bg-gray-400' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Leads & Customers</h1>
          <p className="text-gray-500 mt-1">Manage and follow up with your 100+ leads</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`px-2 ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
            >
              <LayoutGrid className="h-4 w-4 mr-2" /> Grid
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('kanban')}
              className={`px-2 ${viewMode === 'kanban' ? 'bg-white shadow-sm' : ''}`}
            >
              <Kanban className="h-4 w-4 mr-2" /> Kanban
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('dayplan')}
              className={`px-2 ${viewMode === 'dayplan' ? 'bg-white shadow-sm' : ''}`}
            >
              <Calendar className="h-4 w-4 mr-2" /> Today's Plan
            </Button>
          </div>

          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search leads..."
              className="pl-9 w-full sm:w-[200px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="whitespace-nowrap">
                <FileSpreadsheet className="h-4 w-4 mr-2" /> Excel
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToExcel}>
                <Download className="h-4 w-4 mr-2" /> Export to Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => document.getElementById('excel-import')?.click()}>
                <Upload className="h-4 w-4 mr-2" /> Import from Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={downloadTemplate}>
                <FileSpreadsheet className="h-4 w-4 mr-2" /> Download Template
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <input
            type="file"
            id="excel-import"
            className="hidden"
            accept=".xlsx, .xls"
            onChange={handleImportExcel}
          />

          <Button onClick={() => setShowAddForm(!showAddForm)} className="whitespace-nowrap">
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
                  <Label htmlFor="phone">Phone (Pakistan)</Label>
                  <div className="flex">
                    <span className="flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      +92
                    </span>
                    <Input
                      id="phone"
                      className="rounded-l-none"
                      value={formData.phone.replace(/^(\+92|92|0)/, '')}
                      placeholder="3001234567"
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan_type">Offer Plan</Label>
                  <select
                    id="plan_type"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                    value={formData.plan_type}
                    onChange={(e) => setFormData({ ...formData, plan_type: e.target.value as any })}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="Lifetime">Lifetime</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offered_amount">Offer Amount (Rs.)</Label>
                  <Input
                    id="offered_amount"
                    type="number"
                    value={formData.offered_amount}
                    onChange={(e) => setFormData({ ...formData, offered_amount: Number(e.target.value) })}
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
                    <option value="Pending">Pending (New Lead)</option>
                    <option value="Active">Active (Contacted)</option>
                    <option value="Inactive">Not Interested</option>
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
      ) : viewMode === 'dayplan' ? (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Scheduled Visits & Tasks for Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {useMemo(() => {
                  const today = new Date().toISOString().split('T')[0]
                  const todayTasks = tasks.filter(t => t.due_date === today && !t.completed)
                  if (todayTasks.length === 0) return <p className="text-center text-gray-500 py-8">No visits scheduled for today.</p>
                  return todayTasks.map(task => {
                    const customer = customers.find(c => c.id === task.customer_id)
                    return (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {customer?.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{customer?.name}</h4>
                            <p className="text-sm text-gray-500">{task.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-400">{customer?.address || 'No address provided'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="h-8 bg-green-50 text-green-700 border-none px-3" onClick={() => sendWhatsAppTemplate(customer?.phone || '', 'Hi, I am coming to visit you today.')}>
                            <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 px-3" onClick={() => updateTask(task.id, { completed: true })}>
                            <Check className="h-4 w-4 mr-1" /> Mark Visited
                          </Button>
                        </div>
                      </div>
                    )
                  })
                }, [tasks, customers])}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
          {kanbanColumns.map(column => (
            <div key={column.id} className="flex-1 min-w-[300px] bg-gray-100/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                  <h3 className="font-bold text-gray-700">{column.name}</h3>
                  <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                    {filteredCustomers.filter(c => c.status === column.id).length}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {filteredCustomers
                  .filter(c => c.status === column.id)
                  .map(customer => (
                    <Card key={customer.id} className="shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-sm">{customer.name}</h4>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-6 w-6">
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => {
                                setEditingId(customer.id)
                                setEditFormData(customer)
                              }}>Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(customer.id, customer.name)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="space-y-1 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {customer.phone}
                          </div>
                          {customer.last_interaction && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {formatDate(customer.last_interaction)}
                            </div>
                          )}
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[10px] w-full bg-green-50 text-green-700 border-green-100"
                              >
                                <MessageCircle className="h-3 w-3 mr-1" /> WhatsApp <ChevronDown className="ml-1 h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {whatsappTemplates.map((t) => (
                                <DropdownMenuItem key={t.name} onClick={() => sendWhatsAppTemplate(customer.phone, t.text)}>
                                  {t.name}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuItem onClick={() => window.open(`https://wa.me/${customer.phone.replace(/\D/g, '')}`, '_blank')}>
                                Open Direct Chat
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[10px] w-full bg-red-50 text-red-700 border-red-100"
                            onClick={() => updateCustomer(customer.id, { status: 'Inactive' })}
                          >
                            <X className="h-3 w-3 mr-1" /> Not Interested
                          </Button>
                        </div>
                        <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-gray-400">Offer: <span className="text-gray-900 font-medium">{customer.plan_type || 'Monthly'}</span></span>
                            <span className="text-gray-900 font-bold">Rs. {customer.offered_amount || 2000}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
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
                        placeholder="e.g. 03001234567"
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
                        <option value="Pending">Pending</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Not Interested</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label>Offer Plan</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                          value={editFormData?.plan_type || 'Monthly'}
                          onChange={(e) => setEditFormData({ ...editFormData, plan_type: e.target.value as any })}
                        >
                          <option value="Monthly">Monthly</option>
                          <option value="Yearly">Yearly</option>
                          <option value="Lifetime">Lifetime</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Amount (Rs.)</Label>
                        <Input
                          type="number"
                          value={editFormData?.offered_amount || 2000}
                          onChange={e => setEditFormData({ ...editFormData, offered_amount: Number(e.target.value) })}
                        />
                      </div>
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 bg-green-50 text-green-700 hover:bg-green-100 border-none px-2"
                              >
                                <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp <ChevronDown className="ml-1 h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {whatsappTemplates.map((t) => (
                                <DropdownMenuItem key={t.name} onClick={() => sendWhatsAppTemplate(customer.phone, t.text)}>
                                  {t.name}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuItem onClick={() => window.open(`https://wa.me/${customer.phone.replace(/\D/g, '')}`, '_blank')}>
                                Open Direct Chat
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
          {filteredCustomers.length === 0 && !loading && (
            <Card className="border-dashed col-span-full">
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
      )}
    </div>
  )
}
