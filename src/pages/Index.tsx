
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Settings, Send, Loader2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import AudioCapture from '@/components/AudioCapture';
import AvatarVideo from '@/components/AvatarVideo';
import ConfigPanel from '@/components/ConfigPanel';
import ChatHistory from '@/components/ChatHistory';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  videoUrl?: string;
}

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([]);
  const { toast } = useToast();

  const handleAudioCapture = async (audioBlob: Blob) => {
    console.log('Audio captured, processing...', audioBlob.size, 'bytes');
    setIsProcessing(true);
    
    try {
      // Check if API keys are configured
      const openaiKey = localStorage.getItem('openai_api_key');
      const elevenlabsKey = localStorage.getItem('elevenlabs_api_key');
      const didKey = localStorage.getItem('did_api_key');
      
      if (!openaiKey || !elevenlabsKey || !didKey) {
        toast({
          title: "Configuração necessária",
          description: "Configure suas chaves de API nas configurações antes de usar.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }

      // Add user message placeholder
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: '🎤 Processando áudio...',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      // Import the AI service dynamically to avoid loading it if not needed
      const { processVoiceMessage } = await import('../services/aiService');
      
      // Process the voice message through the AI pipeline
      const result = await processVoiceMessage(audioBlob, conversationHistory);
      
      // Update user message with transcription
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, content: result.transcription }
          : msg
      ));

      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: result.response,
        timestamp: new Date(),
        videoUrl: result.videoUrl
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setCurrentVideoUrl(result.videoUrl);
      
      // Update conversation history for context
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: result.transcription },
        { role: 'assistant', content: result.response }
      ]);
      
      toast({
        title: "Resposta processada",
        description: "Liz está respondendo...",
      });
      
    } catch (error) {
      console.error('Error processing audio:', error);
      
      // Remove the placeholder message on error
      setMessages(prev => prev.filter(msg => msg.content !== '🎤 Processando áudio...'));
      
      let errorMessage = "Erro no processamento. Tente novamente.";
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = "Configure suas chaves de API nas configurações.";
        } else if (error.message.includes('Whisper')) {
          errorMessage = "Erro na transcrição de áudio. Verifique sua chave OpenAI.";
        } else if (error.message.includes('GPT')) {
          errorMessage = "Erro na geração de resposta. Verifique sua chave OpenAI.";
        } else if (error.message.includes('ElevenLabs')) {
          errorMessage = "Erro na síntese de voz. Verifique sua chave ElevenLabs.";
        } else if (error.message.includes('D-ID')) {
          errorMessage = "Erro na animação do avatar. Verifique sua chave D-ID.";
        }
      }
      
      toast({
        title: "Erro no processamento",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="border-b border-blue-100 bg-white/70 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 border-2 border-blue-200">
                <AvatarImage src="/placeholder-avatar.png" alt="Liz Avatar" />
                <AvatarFallback className="bg-blue-100 text-blue-600">LZ</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Liz AI Assistant</h1>
                <div className="flex items-center space-x-2">
                  <Badge variant={isPlaying ? "default" : "secondary"} className="text-xs">
                    {isPlaying ? "Falando" : "Ouvindo"}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfig(!showConfig)}
              className="border-blue-200 hover:bg-blue-50"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar and Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Avatar Video */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
              <div className="text-center space-y-4">
                <h2 className="text-lg font-medium text-gray-900">Avatar Liz</h2>
                <AvatarVideo
                  videoUrl={currentVideoUrl}
                  onPlay={handleVideoPlay}
                  onEnded={handleVideoEnd}
                  isLoading={isProcessing}
                />
              </div>
            </Card>

            {/* Audio Controls */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Controles de Áudio</h3>
                  <div className="flex items-center space-x-2">
                    {isProcessing && (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        <span className="text-sm text-blue-600">Processando...</span>
                      </>
                    )}
                  </div>
                </div>
                
                <AudioCapture
                  onAudioCapture={handleAudioCapture}
                  isProcessing={isProcessing}
                />
                
                <div className="flex items-center justify-center space-x-4 pt-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Volume2 className="h-4 w-4" />
                    <span>Clique e mantenha pressionado para falar</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Chat History and Config */}
          <div className="space-y-6">
            {showConfig && (
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
                <ConfigPanel />
              </Card>
            )}
            
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
              <ChatHistory messages={messages} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
