
export const validateApiKeys = () => {
  const openaiKey = localStorage.getItem('openai_api_key');
  const elevenlabsKey = localStorage.getItem('elevenlabs_api_key');
  const didKey = localStorage.getItem('did_api_key');
  
  return {
    openai: !!openaiKey && openaiKey.length > 0,
    elevenlabs: !!elevenlabsKey && elevenlabsKey.length > 0,
    did: !!didKey && didKey.length > 0,
    allValid: !!openaiKey && !!elevenlabsKey && !!didKey
  };
};

export const getApiKeyStatus = () => {
  const validation = validateApiKeys();
  const missing = [];
  
  if (!validation.openai) missing.push('OpenAI');
  if (!validation.elevenlabs) missing.push('ElevenLabs');
  if (!validation.did) missing.push('D-ID');
  
  return {
    isValid: validation.allValid,
    missing,
    message: validation.allValid 
      ? 'Todas as chaves estão configuradas'
      : `Faltam chaves: ${missing.join(', ')}`
  };
};
