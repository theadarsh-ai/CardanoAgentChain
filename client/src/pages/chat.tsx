import ChatInterface from "@/components/chat-interface";

export default function Chat() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Chat with Agents</h1>
        <p className="text-muted-foreground">
          Interact with AI agents using natural language. Use @ to mention specific agents.
        </p>
      </div>

      <ChatInterface />
    </div>
  );
}
