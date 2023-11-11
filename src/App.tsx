import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee } from "./utils/types"
import { TransactionData } from "./components/Transactions/types"

// All comments in this file are placed because there is another bug: employees are not filtered when clicking on the 'View More' button, and I have fixed it.

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions()
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
  const [isLoading, setIsLoading] = useState(false)
  const [approvedTransactions, setApprovedTransactions] = useState<TransactionData[]>([]);


  const handleApprovedTransactions = (data: TransactionData) => {
    const existingIndex = approvedTransactions.findIndex(
      (t) => t.transactionId === data.transactionId
    );
  
    if (existingIndex !== -1) {
      setApprovedTransactions((prevTransactions) => [
        ...prevTransactions.slice(0, existingIndex),
        { ...prevTransactions[existingIndex], approved: data.approved },
        ...prevTransactions.slice(existingIndex + 1),
      ]);
    } else {
      setApprovedTransactions((prevTransactions) => [...prevTransactions, data]);
    }
  };
  

  const transactions = useMemo(
    () => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
    [paginatedTransactions, transactionsByEmployee]
  )

  const loadAllTransactions = useCallback(async () => {
    setIsLoading(true)
    transactionsByEmployeeUtils.invalidateData()

    await employeeUtils.fetchAll()
    setIsLoading(false)
    await paginatedTransactionsUtils.fetchAll()

  }, [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils])

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      paginatedTransactionsUtils.invalidateData()
      await transactionsByEmployeeUtils.fetchById(employeeId)
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  )

  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadAllTransactions()
    }
  }, [employeeUtils.loading, employees, loadAllTransactions])

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={isLoading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue && newValue.id !== "") {
              // setCurrentSelectedEmployee(newValue?.id)
              await loadTransactionsByEmployee(newValue.id);
            } else {
              // setCurrentSelectedEmployee("")
              await loadAllTransactions();
            }
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          <Transactions transactions={transactions} approvedTransactions={approvedTransactions} handleApprovedTransactions={handleApprovedTransactions} />

          {paginatedTransactionsUtils.hasMoreData && (
            <button
              className="RampButton"
              disabled={paginatedTransactionsUtils.loading || transactionsByEmployeeUtils.loading}
              onClick={async () => {
                await loadAllTransactions();
              }}
            >
              View More
            </button>
          )}
           {/* {paginatedTransactionsUtils.hasMoreData && currentSelectedEmployee === "" && (
            <button
              className="RampButton"
              disabled={paginatedTransactionsUtils.loading || transactionsByEmployeeUtils.loading}
              onClick={async () => {
                await loadAllTransactions();
              }}
            >
              View More
            </button>
          )} */}
        </div>
      </main>
    </Fragment>
  )
}
