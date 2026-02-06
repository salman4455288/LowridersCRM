import { useState } from 'react'
import { useCRM } from '@/contexts/CRMContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function Sales() {
  const { sales, customers, profiles, addSale, loading } = useCRM()
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    customer_id: '',
    customer_name: '',
    amount: 0,
    status: 'Pending' as const,
    description: '',
    contributors: [] as string[],
    date: new Date().toISOString().split('T')[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const customer = customers.find(c => c.id === formData.customer_id)
      if (!customer) return

      await addSale({
        ...formData,
        customer_name: customer.name,
      })
      setFormData({
        customer_id: '',
        customer_name: '',
        amount: 0,
        status: 'Pending',
        description: '',
        contributors: [],
        date: new Date().toISOString().split('T')[0],
      })
      setShowAddForm(false)
    } catch (error) {
      console.error('Error adding sale:', error)
    }
  }

  const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0)
  const completedSales = sales.filter(s => s.status === 'Completed')
  const pendingSales = sales.filter(s => s.status === 'Pending')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-500 mt-1">Track and manage your sales pipeline</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Sale
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSales.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSales.length}</div>
          </CardContent>
        </Card>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer *</Label>
                  <select
                    id="customer"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                    required
                  >
                    <option value="">Select customer...</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Contributors (Team Members)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 border rounded-lg bg-gray-50">
                  {profiles.map((profile) => (
                    <div key={profile.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`user-${profile.id}`}
                        checked={formData.contributors.includes(profile.id)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...formData.contributors, profile.id]
                            : formData.contributors.filter(id => id !== profile.id)
                          setFormData({ ...formData, contributors: updated })
                        }}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor={`user-${profile.id}`} className="text-sm truncate cursor-pointer">
                        {profile.full_name || profile.email}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Add Sale</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">Loading...</div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-semibold text-base">{sale.customer_name}</p>
                        <p className="text-sm text-gray-500">{sale.description}</p>
                        {sale.contributors && sale.contributors.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {sale.contributors.map((id) => {
                              const contributor = profiles.find(p => p.id === id)
                              return (
                                <span key={id} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded border border-blue-100 flex items-center">
                                  {contributor?.full_name || contributor?.email || 'Unknown User'}
                                </span>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0">
                    <p className="font-bold text-lg">{formatCurrency(sale.amount)}</p>
                    <p className="text-sm text-gray-500">{formatDate(sale.date)}</p>
                    <span
                      className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${sale.status === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : sale.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                        }`}
                    >
                      {sale.status}
                    </span>
                  </div>
                </div>
              ))}
              {sales.length === 0 && (
                <p className="text-center text-gray-500 py-8">No sales yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
