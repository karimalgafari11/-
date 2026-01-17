
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, Loader2, Mic, MicOff, Check, FileText, Wallet } from 'lucide-react';
import { Chat } from '@google/genai';
import { useApp } from '../../context/AppContext';
import { useFinance } from '../../context/FinanceContext';
import { startFinancialChat } from '../../services/aiService';
import { VoiceCommandParser, VoiceAction } from '../../utils/VoiceCommandParser';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const AIAssistant: React.FC = () => {
  const { t, showNotification } = useApp();
  const { financialSummary } = useFinance();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [previewAction, setPreviewAction] = useState<VoiceAction | null>(null);

  const chatRef = useRef<Chat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('المتصفح لا يدعم الأوامر الصوتية');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'ar-SA';
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleVoiceCommand(transcript);
    };
    recognitionRef.current.onerror = () => setIsListening(false);
    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.start();
  };

  const handleVoiceCommand = (text: string) => {
    const action = VoiceCommandParser.parse(text);
    if (action.type !== 'unknown') {
      setPreviewAction(action);
      setMessages(prev => [...prev, { role: 'user', text: `🎤 ${text}` }]);
    } else {
      setInput(text);
      setMessages(prev => [...prev, { role: 'user', text: `🎤 ${text}` }]);
      handleSendMessage(text);
    }
  };

  const executeAction = () => {
    if (!previewAction) return;
    if (previewAction.type === 'create_invoice') {
      navigate('/invoices');
      showNotification('جاري فتح نموذج الفاتورة...', 'info');
    } else if (previewAction.type === 'create_voucher') {
      navigate('/vouchers');
      showNotification('جاري فتح نموذج السند...', 'info');
    }
    setPreviewAction(null);
    setIsOpen(false);
  };

  const handleOpen = () => {
    if (!chatRef.current) {
      const systemInstruction = `
        You are a professional financial consultant for 'Alzhra Finance'. 
        Current Context: ${financialSummary}
        Always respond in Arabic. Be helpful, concise, and professional.
      `;
      chatRef.current = startFinancialChat(systemInstruction);
    }
    setIsOpen(true);
  };

  const handleSendMessage = async (textOverride?: string) => {
    const messageText = textOverride || input;
    if (!messageText.trim() || isTyping) return;

    if (!textOverride) {
      setInput('');
      setMessages(prev => [...prev, { role: 'user', text: messageText }]);
    }

    setIsTyping(true);

    try {
      if (!chatRef.current) handleOpen();
      if (chatRef.current) {
        const response = await chatRef.current.sendMessage({ message: messageText });
        setMessages(prev => [...prev, { role: 'model', text: response.text || "عذراً، لم أتمكن من معالجة الرد." }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'model', text: "عذراً، واجهت مشكلة في معالجة طلبك." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 end-6 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300 transition-colors">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <Sparkles size={20} className="fill-yellow-300 text-yellow-300" />
              </div>
              <div>
                <h4 className="font-bold text-sm">{t('aiAssistantTitle')}</h4>
                <p className="text-[10px] text-blue-100">{t('aiAssistantDesc')}</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950/50 custom-scrollbar">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                <Bot size={48} className="mb-4 opacity-20" />
                <p className="text-sm font-bold">{t('aiInitialMsg')}</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-te-none shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-ts-none border border-gray-100 dark:border-gray-700 shadow-sm font-medium'
                  }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex gap-1">
                  <Loader2 size={16} className="animate-spin text-blue-500" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors relative">
            {/* Preview Overlay */}
            {previewAction && (
              <div className="absolute inset-x-0 bottom-full mb-4 mx-4 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border-2 border-primary/20 animate-in slide-in-from-bottom-5 z-20">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/50 rounded-xl">
                    {previewAction.type === 'create_invoice' && <FileText className="text-indigo-600" size={24} />}
                    {previewAction.type === 'create_voucher' && <Wallet className="text-emerald-600" size={24} />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">
                      {previewAction.type === 'create_invoice' ? 'إنشاء فاتورة جديدة' : 'إنشاء سند جديد'}
                    </h4>
                    <div className="text-xs text-slate-500 mt-1 space-y-1">
                      {previewAction.data.partyName && <p>الطرف: <span className="font-medium text-slate-900 dark:text-slate-300">{previewAction.data.partyName}</span></p>}
                      {previewAction.data.amount && <p>المبلغ: <span className="font-medium text-slate-900 dark:text-slate-300">{previewAction.data.amount}</span></p>}
                      {previewAction.data.description && <p>الوصف: <span className="font-medium text-slate-900 dark:text-slate-300">{previewAction.data.description}</span></p>}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={executeAction} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                        <Check size={14} /> تنفيذ
                      </button>
                      <button onClick={() => setPreviewAction(null)} className="px-3 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 py-1.5 rounded-lg text-xs font-bold">
                        إلغاء
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-2xl px-3 py-2 border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <button onClick={startListening} className={`p-2 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}>
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <input
                type="text"
                placeholder={isListening ? 'جاري الاستماع...' : t('aiPromptPlaceholder')}
                className="flex-1 bg-transparent border-none outline-none text-sm p-1 font-bold dark:text-gray-100"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={() => handleSendMessage()} disabled={!input.trim() || isTyping} className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 transition-all">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <button onClick={handleOpen} className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen ? 'bg-red-500 rotate-90 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
        {isOpen ? <X size={28} /> : <Sparkles size={28} className="fill-current" />}
        {!isOpen && <span className="absolute -top-1 -end-1 w-5 h-5 bg-red-500 border-2 border-white dark:border-gray-900 rounded-full animate-bounce"></span>}
      </button>
    </div>
  );
};

export default AIAssistant;
