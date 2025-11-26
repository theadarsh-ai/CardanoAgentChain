import BlockchainPanel from "../blockchain-panel";

export default function BlockchainPanelExample() {
  return (
    <div className="p-6 grid md:grid-cols-2 gap-6 max-w-4xl">
      <BlockchainPanel type="hydra" />
      <BlockchainPanel type="cardano" />
    </div>
  );
}
