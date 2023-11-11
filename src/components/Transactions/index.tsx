import { useCallback } from "react"
import { useCustomFetch } from "src/hooks/useCustomFetch"
import { SetTransactionApprovalParams } from "src/utils/types"
import { TransactionPane } from "./TransactionPane"
import { SetTransactionApprovalFunction, TransactionData, TransactionsComponent } from "./types"

export const Transactions: TransactionsComponent = ({ transactions, approvedTransactions, handleApprovedTransactions }) => {
  const { fetchWithoutCache, loading } = useCustomFetch()

  const setTransactionApproval = useCallback<SetTransactionApprovalFunction>(
    async ({ transactionId, newValue }) => {
      await fetchWithoutCache<void, SetTransactionApprovalParams>("setTransactionApproval", {
        transactionId,
        value: newValue,
      })
    },
    [fetchWithoutCache]
  )

  if (transactions === null) {
    return <div className="RampLoading--container">Loading...</div>
  }

  return (
    <div data-testid="transaction-container">
      {transactions.map((transaction) => (
        <TransactionPane
          key={transaction.id}
          transaction={transaction}
          loading={loading}
          approved={ approvedTransactions?.some((t:TransactionData) => t.transactionId === transaction.id)
            ? approvedTransactions?.find((t) => t?.transactionId === transaction.id)?.approved || false
            : transaction.approved}
          setTransactionApproval={setTransactionApproval}
          approvedTransactions={handleApprovedTransactions}
        />
      ))}
    </div>
  )
}
