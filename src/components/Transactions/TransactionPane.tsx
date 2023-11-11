import { InputCheckbox } from '../InputCheckbox';
import { TransactionPaneComponent } from './types';

export const TransactionPane: TransactionPaneComponent = ({
  transaction,
  loading,
  approved,
  setTransactionApproval: consumerSetTransactionApproval,
  approvedTransactions
}) => {


  const handleCheckboxChange = async (newValue: boolean) => {
  
    const approvalData = {
      transactionId: transaction.id,
      approved: newValue,
    };

    approvedTransactions(approvalData)

    await consumerSetTransactionApproval({
      transactionId: transaction.id,
      newValue,
    });

    
  };

  return (
    <div className="RampPane">
      <div className="RampPane--content">
        <p className="RampText">{transaction.merchant}</p>
        <b>{moneyFormatter.format(transaction.amount)}</b>
        <p className="RampText--hushed RampText--s">
          {transaction.employee.firstName} {transaction.employee.lastName} - {transaction.date}
        </p>
      </div>
      <InputCheckbox
        id={transaction.id}
        checked={approved}
        disabled={loading}
        onChange={handleCheckboxChange}
      />
    </div>
  );
};

const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});


