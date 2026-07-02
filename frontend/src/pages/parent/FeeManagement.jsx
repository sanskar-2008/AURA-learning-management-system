import { useState } from 'react'
import Alert from '../../components/Alert'
import EmptyState from '../../components/EmptyState'
import LoadingState from '../../components/LoadingState'
import { useParentContext } from '../../context/ParentContext'
import { useChildFees } from '../../hooks/useParentData'
import parentApi from '../../services/parent'
import { formatDate } from '../../utils/assignmentStatus'

function feeStatusClass(status) {
  switch (status) {
    case 'paid':
      return 'bg-green-50 text-green-700'
    case 'overdue':
      return 'bg-red-50 text-red-700'
    default:
      return 'bg-amber-50 text-amber-700'
  }
}

function FeeTable({ fees, showActions, payingFeeId, onPay }) {
  if (fees.length === 0) {
    return null
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Description</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Amount</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Due Date</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
            {showActions ? (
              <th className="px-4 py-3 text-left font-medium text-slate-600">Action</th>
            ) : (
              <th className="px-4 py-3 text-left font-medium text-slate-600">Paid On</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {fees.map((fee) => (
            <tr key={fee.id}>
              <td className="px-4 py-3 text-slate-900">{fee.description}</td>
              <td className="px-4 py-3 text-slate-700">${fee.amount.toFixed(2)}</td>
              <td className="px-4 py-3 text-slate-700">{formatDate(fee.due_date) || '—'}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${feeStatusClass(fee.status)}`}
                >
                  {fee.status}
                </span>
              </td>
              <td className="px-4 py-3">
                {showActions ? (
                  <button
                    type="button"
                    onClick={() => onPay(fee.id)}
                    disabled={payingFeeId === fee.id}
                    className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {payingFeeId === fee.id ? 'Processing...' : 'Pay Fee'}
                  </button>
                ) : (
                  <span className="text-slate-700">{formatDate(fee.paid_at) || '—'}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function FeeManagement() {
  const { selectedChildId } = useParentContext()
  const { data, loading, error, refetch } = useChildFees(selectedChildId)
  const pendingFees = data?.pending_fees ?? []
  const paymentHistory = data?.payment_history ?? []

  const [payingFeeId, setPayingFeeId] = useState(null)
  const [success, setSuccess] = useState('')
  const [payError, setPayError] = useState('')

  async function handlePay(feeId) {
    setPayingFeeId(feeId)
    setPayError('')
    setSuccess('')

    try {
      const response = await parentApi.payFee(selectedChildId, feeId)
      setSuccess(response.message || 'Fee payment submitted successfully')
      await refetch()
    } catch (err) {
      setPayError(err.message || 'Failed to submit payment')
    } finally {
      setPayingFeeId(null)
    }
  }

  if (loading) {
    return <LoadingState message="Loading fees..." />
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </div>
    )
  }

  const hasNoFees = pendingFees.length === 0 && paymentHistory.length === 0

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Fee Payment</h1>
        <p className="mt-1 text-sm text-slate-600">
          View fee details, payment history, and pay pending fees.
        </p>
      </header>

      <Alert type="success" message={success} onDismiss={() => setSuccess('')} />
      <Alert type="error" message={payError} onDismiss={() => setPayError('')} />

      {hasNoFees ? (
        <EmptyState title="No fees" message="There are no fee records for your child." />
      ) : (
        <>
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Pending Fees</h2>
            {pendingFees.length === 0 ? (
              <p className="text-sm text-slate-600">No pending fees at this time.</p>
            ) : (
              <FeeTable
                fees={pendingFees}
                showActions
                payingFeeId={payingFeeId}
                onPay={handlePay}
              />
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Payment History</h2>
            {paymentHistory.length === 0 ? (
              <p className="text-sm text-slate-600">No payment history yet.</p>
            ) : (
              <FeeTable fees={paymentHistory} showActions={false} />
            )}
          </section>
        </>
      )}
    </div>
  )
}
