
import React, { useRef, useEffect } from 'react';
import { MessageSquare, User, Bot, Clock, Volume2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  videoUrl?: string;
}

interface ChatHistoryProps {
  messages: Message[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <MessageSquare className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-medium text-gray-900">Histórico da Conversa</h3>
        <Badge variant="secondary" className="ml-auto">
          {messages.length} mensagens
        </Badge>
      </div>

      <ScrollArea className="h-96 w-full rounded-md border border-blue-100 p-4">
        <div ref={scrollRef} className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                Nenhuma conversa ainda.
                <br />
                Clique no microfone para começar!
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <Card 
                key={message.id} 
                className={`p-3 max-w-[85%] ${
                  message.type === 'user' 
                    ? 'ml-auto bg-blue-50 border-blue-200' 
                    : 'mr-auto bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start space-x-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
                    message.type === 'user' ? 'bg-blue-500' : 'bg-gray-500'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="h-3 w-3" />
                    ) : (
                      <Bot className="h-3 w-3" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600">
                        {message.type === 'user' ? 'Você' : 'Liz'}
                      </span>
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(message.timestamp)}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {message.content}
                    </p>
                    
                    {/* Media indicators */}
                    {(message.audioUrl || message.videoUrl) && (
                      <div className="flex items-center space-x-2 mt-2">
                        {message.audioUrl && (
                          <Badge variant="outline" className="text-xs">
                            <Volume2 className="h-3 w-3 mr-1" />
                            Áudio
                          </Badge>
                        )}
                        {message.videoUrl && (
                          <Badge variant="outline" className="text-xs">
                            <Bot className="h-3 w-3 mr-1" />
                            Vídeo
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {messages.length > 0 && (
        <div className="text-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
            className="text-xs"
          >
            Limpar Histórico
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
