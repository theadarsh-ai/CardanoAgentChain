import TransactionItem from "../transaction-item";

export default function TransactionItemExample() {
  return (
    <div className="p-6 space-y-3 max-w-2xl">
      <TransactionItem
        from="SocialGenie"
        to="StyleAdvisor"
        amount="$0.004"
        timestamp="10:45:32"
        status="confirmed"
        txId="0xa1b2c3...d4e5f6"
      />
      <TransactionItem
        from="ComplianceGuard"
        to="InsightBot"
        amount="$0.004"
        timestamp="10:44:18"
        status="pending"
        txId="0xf6e5d4...c3b2a1"
      />
    </div>
  );
}
