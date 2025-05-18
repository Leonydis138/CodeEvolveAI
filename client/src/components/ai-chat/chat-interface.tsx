import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, UserRound, Code, Lightbulb, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sourcedKnowledge?: string[];
}

interface ChatResponse {
  message: string;
  sourcedKnowledge: string[];
  codeImprovements?: {
    file: string;
    changes: string;
    reason: string;
  }[];
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi, I'm your AI assistant. I've been learning from research papers and code analysis. How can I help you today?",
      timestamp: new Date(),
      sourcedKnowledge: []
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // API call for sending a message
  const sendMessageMutation = useMutation<ChatResponse, Error, string>({
    mutationFn: async (message: string) => {
      return apiRequest<ChatResponse>("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message })
      });
    },
    onSuccess: (data) => {
      addMessage({
        id: Date.now().toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        sourcedKnowledge: data.sourcedKnowledge
      });
      
      // If there are code improvements, show a toast notification
      if (data.codeImprovements && data.codeImprovements.length > 0) {
        toast({
          title: "Code Improvements Detected",
          description: `I found ${data.codeImprovements.length} possible improvements to the codebase.`,
          variant: "default",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      console.error("Error sending message:", error);
    }
  });

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date()
    };
    
    addMessage(userMessage);
    sendMessageMutation.mutate(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="chat" className="flex items-center">
            <Bot className="mr-2 h-4 w-4" />
            <span>Chat</span>
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center">
            <Brain className="mr-2 h-4 w-4" />
            <span>Knowledge Base</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="flex-1 flex flex-col h-full">
          <div className="flex-1 overflow-y-auto px-1 py-2 mb-4 bg-editor-surface rounded-md">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}
              >
                <div 
                  className={`
                    inline-block max-w-[80%] rounded-lg px-4 py-2
                    ${message.role === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-editor-line text-editor-text"
                    }
                  `}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.role === "user" 
                      ? <UserRound className="h-4 w-4" /> 
                      : <Bot className="h-4 w-4" />
                    }
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  
                  {message.sourcedKnowledge && message.sourcedKnowledge.length > 0 && (
                    <div className="mt-2 text-xs flex flex-wrap gap-1">
                      {message.sourcedKnowledge.map((source, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <Lightbulb className="h-3 w-3 mr-1" /> 
                          {source}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message here..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="resize-none flex-1"
              rows={2}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputValue.trim() || sendMessageMutation.isPending}
              className="self-end"
            >
              {sendMessageMutation.isPending ? (
                <span className="animate-spin">⌛</span>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="knowledge" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <Code className="mr-2 h-5 w-5" />
              Research Knowledge
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Knowledge extracted from research papers and technical documents
            </p>
            <KnowledgeBase />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KnowledgeBase() {
  const [knowledgeItems, setKnowledgeItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchKnowledge = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest<any[]>("/api/knowledge", {
          method: "GET"
        });
        setKnowledgeItems(response);
      } catch (error) {
        console.error("Error fetching knowledge:", error);
        toast({
          title: "Error",
          description: "Failed to load knowledge base.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchKnowledge();
  }, [toast]);
  
  if (isLoading) {
    return <div className="text-center py-6">Loading knowledge base...</div>;
  }
  
  if (knowledgeItems.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No knowledge items found. Try analyzing some research papers.
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {knowledgeItems.map((item, index) => (
        <div key={index} className="border rounded-md p-3">
          <div className="flex justify-between items-start">
            <h4 className="font-medium">{item.technique}</h4>
            <Badge variant={item.applied ? "default" : "outline"}>
              {item.applied ? "Applied" : "Not Applied"}
            </Badge>
          </div>
          <p className="text-sm mt-1">{item.description}</p>
          <div className="flex items-center mt-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="mr-2">
              {item.domain}
            </Badge>
            <span>Confidence: {item.confidence}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}