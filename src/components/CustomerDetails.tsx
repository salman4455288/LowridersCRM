import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCRM } from '@/contexts/CRMContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    ArrowLeft, Phone, Mail, MapPin, Calendar,
    MessageSquare, Clock
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function CustomerDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { customers, getCustomerInteractions, getCustomerNotes, addNote } = useCRM()

    const customer = customers.find(c => c.id === id)
    const [notes, setNotes] = useState<any[]>([])
    const [interactions, setInteractions] = useState<any[]>([])
    const [newRemark, setNewRemark] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) {
            loadDetails()
        }
    }, [id])

    const loadDetails = async () => {
        setLoading(true)
        try {
            const [notesData, interactionsData] = await Promise.all([
                getCustomerNotes(id!),
                getCustomerInteractions(id!)
            ])
            setNotes(notesData)
            setInteractions(interactionsData)
        } catch (error) {
            console.error('Error loading details:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddRemark = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newRemark.trim() || !id) return

        try {
            await addNote(id, newRemark)
            setNewRemark('')
            await loadDetails()
        } catch (error) {
            console.error('Error adding remark:', error)
        }
    }

    if (loading && !customer) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!customer && !loading) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold">Customer not found</h2>
                <Button variant="ghost" onClick={() => navigate('/customers')}>Back to Customers</Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate('/customers')} className="hover:bg-blue-50 text-blue-600">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Customers
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card className="overflow-hidden border-none shadow-lg">
                        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                        <CardContent className="relative pt-0 px-6 pb-6">
                            <div className="absolute -top-12 left-6">
                                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-xl">
                                    <div className="w-full h-full rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-3xl">
                                        {customer?.name?.[0]}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-32 space-y-2">
                                <h3 className="font-bold text-2xl text-gray-900">{customer?.name}</h3>
                                <div className="flex gap-2">
                                    <span className={`px-2 py-0.5 text-[10px] uppercase font-black tracking-widest rounded-full ${customer?.status === 'Active' ? 'bg-green-100 text-green-700' :
                                        customer?.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {customer?.status}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4 mt-6 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-3 text-sm text-gray-600 group cursor-pointer hover:text-blue-600 transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                        <Phone className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                                    </div>
                                    {customer?.phone}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600 group cursor-pointer hover:text-blue-600 transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                        <Mail className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                                    </div>
                                    {customer?.email || 'No email provided'}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600 group">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <span className="line-clamp-2">{customer?.address || 'No address provided'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600 group">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                    </div>
                                    Joined: {customer ? formatDate(customer.created_at) : ''}
                                </div>
                            </div>

                            <div className="mt-8 p-4 rounded-xl bg-gray-50 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-medium">Plan Type</span>
                                    <span className="font-bold text-gray-900 bg-white px-3 py-1 rounded-lg shadow-sm border border-gray-100">{customer?.plan_type || 'Monthly'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-medium">Offered Amount</span>
                                    <span className="font-bold text-blue-600 text-lg">Rs. {customer?.offered_amount?.toLocaleString()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <MessageSquare className="h-4 w-4 text-blue-600" />
                                </div>
                                Add Remark / Note
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddRemark} className="space-y-4">
                                <textarea
                                    placeholder="Enter your internal remarks or follow-up notes here..."
                                    value={newRemark}
                                    onChange={(e) => setNewRemark(e.target.value)}
                                    className="flex min-h-[120px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm ring-offset-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                                />
                                <div className="flex justify-end">
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-8 rounded-xl shadow-md shadow-blue-100 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                        Save Remark
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-xl flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-500" />
                                Timeline & Remarks
                            </h3>
                            <div className="text-xs text-gray-400 font-medium bg-gray-100 px-3 py-1 rounded-full">
                                {notes.length + interactions.length} Total Events
                            </div>
                        </div>

                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-100 before:via-blue-200 before:to-transparent">
                            {notes.length === 0 && interactions.length === 0 && (
                                <div className="relative pl-12">
                                    <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                                        <MessageSquare className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                                        <p className="text-gray-400 font-medium">No history recorded yet.</p>
                                    </div>
                                </div>
                            )}

                            {[...notes.map(n => ({ ...n, eventType: 'note', sortDate: n.created_at })),
                            ...interactions.map(i => ({ ...i, eventType: 'interaction', sortDate: i.date }))]
                                .sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime())
                                .map((event, index) => (
                                    <div key={event.id} className="relative pl-12 group animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                                        <div className={`absolute left-0 top-0 mt-1.5 flex h-10 w-10 items-center justify-center rounded-xl border-4 border-white ${event.eventType === 'note' ? 'bg-blue-500' :
                                            event.type === 'call' ? 'bg-green-500' :
                                                event.type === 'meeting' ? 'bg-purple-500' : 'bg-orange-500'
                                            } text-white shadow-md ring-1 ring-gray-100 transition-all group-hover:scale-110 group-hover:rotate-6`}>
                                            {event.eventType === 'note' ? <MessageSquare className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                        </div>
                                        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                                            <CardContent className="p-0">
                                                <div className="p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${event.eventType === 'note' ? 'bg-blue-50 text-blue-700' :
                                                            event.type === 'call' ? 'bg-green-50 text-green-700' :
                                                                event.type === 'meeting' ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-orange-700'
                                                            }`}>
                                                            {event.eventType === 'note' ? 'Internal Remark' : event.type}
                                                        </span>
                                                        <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{formatDate(event.sortDate)}</span>
                                                    </div>
                                                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{event.content}</p>
                                                </div>
                                                {event.eventType === 'note' && (
                                                    <div className="bg-blue-600/5 px-4 py-2 border-t border-blue-600/10 flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                                                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">Verified Remark</span>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
