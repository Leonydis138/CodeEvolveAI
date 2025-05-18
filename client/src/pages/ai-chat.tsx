import { Header } from "@/components/layout/header";
import { ChatInterface } from "@/components/ai-chat/chat-interface";
import { Sidebar } from "@/components/layout/sidebar";

export default function AIChat() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="container mx-auto space-y-6">
            <h1 className="text-3xl font-bold">AI Assistant</h1>
            <p className="text-muted-foreground">
              Chat with the AI assistant that has learned from research papers and code analysis. 
              It can answer questions about computational complexity, suggest code improvements, 
              and even update its own code based on learned principles.
            </p>
            
            <div className="border rounded-lg p-4 h-[calc(100vh-220px)]">
              <ChatInterface />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}