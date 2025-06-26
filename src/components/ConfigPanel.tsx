
import React, { useState } from 'react';
import { Key, Eye, EyeOff, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface ApiKeys {
  openai: string;
  elevenlabs: string;
  did: string;
}

const ConfigPanel: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: localStorage.getItem('openai_api_key') || '',
    elevenlabs: localStorage.getItem('elevenlabs_api_key') || '',
    did: localStorage.getItem('did_api_key') || ''
  });
  
  const [showKeys, setShowKeys] = useState({
    openai: false,
    elevenlabs: false,
    did: false
  });
  
  const { toast } = useToast();

  const handleKeyChange = (provider: keyof ApiKeys, value: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: value }));
  };

  const toggleShowKey = (provider: keyof ApiKeys) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const saveApiKeys = () => {
    try {
      // Save to localStorage (in production, this should be secured)
      localStorage.setItem('openai_api_key', apiKeys.openai);
      localStorage.setItem('elevenlabs_api_key', apiKeys.elevenlabs);
      localStorage.setItem('did_api_key', apiKeys.did);
      
      console.log('API keys saved to localStorage');
      
      toast({
        title: "Configurações salvas",
        description: "Suas chaves de API foram salvas com segurança.",
      });
    } catch (error) {
      console.error('Error saving API keys:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Key className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-medium text-gray-900">Configurações de API</h3>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Configure suas chaves de API para habilitar todas as funcionalidades do sistema.
          As chaves são armazenadas localmente no seu navegador.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {/* OpenAI API Key */}
        <div className="space-y-2">
          <Label htmlFor="openai-key" className="text-sm font-medium">
            OpenAI API Key
          </Label>
          <div className="flex space-x-2">
            <Input
              id="openai-key"
              type={showKeys.openai ? "text" : "password"}
              placeholder="sk-..."
              value={apiKeys.openai}
              onChange={(e) => handleKeyChange('openai', e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleShowKey('openai')}
            >
              {showKeys.openai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Para transcrição de áudio (Whisper) e geração de texto (GPT)
          </p>
        </div>

        {/* ElevenLabs API Key */}
        <div className="space-y-2">
          <Label htmlFor="elevenlabs-key" className="text-sm font-medium">
            ElevenLabs API Key
          </Label>
          <div className="flex space-x-2">
            <Input
              id="elevenlabs-key"
              type={showKeys.elevenlabs ? "text" : "password"}
              placeholder="sk_..."
              value={apiKeys.elevenlabs}
              onChange={(e) => handleKeyChange('elevenlabs', e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleShowKey('elevenlabs')}
            >
              {showKeys.elevenlabs ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Para síntese de voz (Text-to-Speech)
          </p>
        </div>

        {/* D-ID API Key */}
        <div className="space-y-2">
          <Label htmlFor="did-key" className="text-sm font-medium">
            D-ID API Key
          </Label>
          <div className="flex space-x-2">
            <Input
              id="did-key"
              type={showKeys.did ? "text" : "password"}
              placeholder="Basic ..."
              value={apiKeys.did}
              onChange={(e) => handleKeyChange('did', e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleShowKey('did')}
            >
              {showKeys.did ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Para animação do avatar com sincronização labial
          </p>
        </div>
      </div>

      <Button 
        onClick={saveApiKeys}
        className="w-full bg-blue-500 hover:bg-blue-600"
      >
        <Save className="h-4 w-4 mr-2" />
        Salvar Configurações
      </Button>

      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>Como obter as chaves:</strong></p>
        <p>• OpenAI: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">platform.openai.com/api-keys</a></p>
        <p>• ElevenLabs: <a href="https://elevenlabs.io/app/settings/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">elevenlabs.io/app/settings/api-keys</a></p>
        <p>• D-ID: <a href="https://studio.d-id.com/account-settings" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">studio.d-id.com/account-settings</a></p>
      </div>
    </div>
  );
};

export default ConfigPanel;
