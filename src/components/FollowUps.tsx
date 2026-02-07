import { useState } from 'react'
import { useCRM } from '@/contexts/CRMContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle, CheckCircle2, Clock, User, Phone, Calendar, ChevronDown, X } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function FollowUps() {
    const { tasks, customers, updateTask, addNote, loading } = useCRM()
    const [showRemarkModal, setShowRemarkModal] = useState(false)
    const [selectedTask, setSelectedTask] = useState<{ id: string, customerId: string } | null>(null)
    const [remark, setRemark] = useState('')

    // Filter for pending tasks and sort by due date
    const pendingFollowUps = tasks
        .filter(t => !t.completed)
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())

    const handleInitialComplete = (taskId: string, customerId: string) => {
        setSelectedTask({ id: taskId, customerId })
        setRemark('')
        setShowRemarkModal(true)
    }

    const confirmComplete = async () => {
        if (!selectedTask) return

        try {
            if (remark.trim()) {
                await addNote(selectedTask.customerId, `[Follow-up Completed] ${remark}`)
            }
            await updateTask(selectedTask.id, { completed: true })
            toast.success('Follow-up marked as completed')
            setShowRemarkModal(false)
            setSelectedTask(null)
            setRemark('')
        } catch (error) {
            console.error('Error completing task:', error)
            toast.error('Failed to update task')
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6 relative">
            {showRemarkModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                            <h3 className="font-semibold text-lg">Complete Follow-up</h3>
                            <Button variant="ghost" size="sm" onClick={() => setShowRemarkModal(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <CardContent className="p-4 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Add a closing remark (optional)</label>
                                <textarea
                                    className="flex w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                                    placeholder="e.g. Customer is interested, will visit next week..."
                                    value={remark}
                                    onChange={(e) => setRemark(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" onClick={() => setShowRemarkModal(false)}>Cancel</Button>
                                <Button onClick={confirmComplete} className="bg-green-600 hover:bg-green-700 text-white">
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Complete Task
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Pending Follow-ups</h1>
                <p className="text-gray-500 mt-1">Don't let your leads go cold. Reach out today.</p>
            </div>

            <div className="grid gap-4">
                {pendingFollowUps.map((task) => {
                    const customer = customers.find(c => c.id === task.customer_id)
                    const isOverdue = new Date(task.due_date) < new Date(new Date().setHours(0, 0, 0, 0))

                    return (
                        <Card key={task.id} className={`hover:shadow-md transition-shadow border-l-4 ${isOverdue ? 'border-l-red-500 bg-red-50/30' : 'border-l-blue-500'}`}>
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-2">
                                            {isOverdue ? (
                                                <Clock className="h-5 w-5 text-red-500" />
                                            ) : (
                                                <Calendar className="h-5 w-5 text-blue-500" />
                                            )}
                                            <h3 className={`text-lg font-bold ${isOverdue ? 'text-red-700' : 'text-gray-900'}`}>{task.title}</h3>
                                            {isOverdue && <span className="text-[10px] font-bold uppercase bg-red-100 text-red-600 px-2 py-0.5 rounded">Overdue</span>}
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1.5">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium text-gray-900">{task.customer_name}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <span>Due: {formatDate(task.due_date)}</span>
                                            </div>
                                            {customer?.phone && (
                                                <div className="flex items-center gap-1.5">
                                                    <Phone className="h-4 w-4 text-gray-400" />
                                                    <span>{customer.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    disabled={!customer?.phone}
                                                    className="bg-green-600 hover:bg-green-700 text-white flex-1 md:flex-none"
                                                >
                                                    <MessageCircle className="h-4 w-4 mr-2" />
                                                    WhatsApp <ChevronDown className="ml-1 h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {whatsappTemplates.map((t) => (
                                                    <DropdownMenuItem
                                                        key={t.name}
                                                        onClick={() => customer?.phone && sendWhatsAppTemplate(customer.phone, t.text)}
                                                    >
                                                        {t.name}
                                                    </DropdownMenuItem>
                                                ))}
                                                <DropdownMenuItem
                                                    onClick={() => customer?.phone && window.open(`https://wa.me/${customer.phone.replace(/\D/g, '')}`, '_blank')}
                                                >
                                                    Open Direct Chat
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                        <Button
                                            variant="outline"
                                            onClick={() => handleInitialComplete(task.id, task.customer_id)}
                                            className="border-gray-200 hover:bg-gray-50 flex-1 md:flex-none"
                                        >
                                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                                            Mark Done
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}

                {pendingFollowUps.length === 0 && (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <Clock className="h-12 w-12 text-gray-200 mb-4" />
                            <p>No pending follow-ups. You're all caught up!</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
