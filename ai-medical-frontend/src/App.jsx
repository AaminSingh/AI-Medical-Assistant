import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Activity, MessageSquare, History, FileText, AlertTriangle,
  Send, Download, User, Bot, Plus, ChevronRight, ShieldAlert,
  Stethoscope, Lock, Mail, Loader2
} from 'lucide-react';

// Configure axios to always send cookies (JWT) with requests
axios.defaults.withCredentials = true;
const API_BASE_URL = 'http://localhost:8000/api/v1';

const LoginScreen = ({ onLoginSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
      const payload = isLoginMode
        ? { email, password }
        : { email, password, username, fullName };

      const response = await axios.post(`${API_BASE_URL}${endpoint}`, payload);

      if (response.data.success) {
        if (isLoginMode) {
          onLoginSuccess(response.data.data.user);
        } else {
          setIsLoginMode(true);
          setPassword('');
          setError('Registration successful! Please login.');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Connection failed. Is your Node.js backend running on port 8000?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-8 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Activity size={32} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">DSAI Medical AI</h2>
          <p className="text-blue-100 text-sm">
            {isLoginMode ? 'Sign in to access your portal' : 'Create your patient account'}
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className={`p-3 rounded-lg text-sm border ${error.includes('successful') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                {error}
              </div>
            )}

            {!isLoginMode && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : (isLoginMode ? 'Secure Login' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button type="button" onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }} className="text-sm text-blue-600 hover:underline font-medium">
              {isLoginMode ? "Don't have an account? Register here" : "Already have an account? Login here"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('chat');
  const [inputValue, setInputValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hello. I am your AI Medical Diagnosis Assistant. Please describe your symptoms in detail.',
      type: 'text'
    }
  ]);

  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAnalyzing]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMsg = { id: Date.now(), sender: 'user', text: inputValue, type: 'text' };
    const updatedMessages = [...messages, newUserMsg];

    setMessages(updatedMessages);
    setInputValue('');
    setIsAnalyzing(true);
    setIsEmergency(false);

    try {
      // Filter and format the conversation history for the backend
      const chatHistory = updatedMessages
        .filter(msg => msg.type === 'text')
        .map(msg => ({
          role: msg.sender === 'ai' ? 'assistant' : 'user',
          content: msg.text
        }));

      // Send the entire array of messages to the new endpoint
      const response = await axios.post(`${API_BASE_URL}/diagnose`, {
        messages: chatHistory
      });

      const { data } = response.data;

      // Handle Emergency Triage Override
      if (data.isEmergency) {
        setIsEmergency(true);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'ai',
          text: data.message || 'URGENT: Your symptoms indicate a potentially life-threatening condition. The AI diagnosis has been bypassed.',
          type: 'emergency'
        }]);
      } else if (data.type === 'question') {
        // Handle Conversational Follow-Up
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'ai',
          text: data.text,
          type: 'text'
        }]);
      } else {
        // Handle Final Diagnosis Card
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'ai',
          text: 'I have gathered enough details and analyzed your symptoms using our medical ML engine. Here is your differential diagnosis:',
          type: 'diagnosis',
          data: data
        }]);
      }
    } catch (error) {
      console.error("Diagnosis Error:", error);
      const errorMsg = error.response?.data?.message || "I'm sorry, there was a problem connecting to the diagnosis server. Please try again.";
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: `Error: ${errorMsg}`,
        type: 'text'
      }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewChat = () => {
    setMessages([{
      id: Date.now(), sender: 'ai', type: 'text',
      text: `Hello ${user.fullName}. I am your AI Medical Diagnosis Assistant. Please describe your symptoms in detail.`
    }]);
    setIsEmergency(false);
    setActiveView('chat');
  };

  const generatePDF = () => {
    window.print();
  };

  const Sidebar = () => (
    <div className="no-print w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 hidden md:flex">
      <div className="p-4 flex items-center gap-3 text-white border-b border-slate-800 font-semibold text-lg">
        <Activity className="text-blue-400" />
        <span>DSAI Medical AI</span>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <button onClick={handleNewChat} className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors mb-6 shadow-sm">
          <Plus size={18} /> <span>New Consultation</span>
        </button>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Menu</p>
          <button
            onClick={() => setActiveView('chat')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeView === 'chat' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50'}`}
          >
            <MessageSquare size={18} /> <span>Chat Assistant</span>
          </button>
        </div>
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
            <User size={20} className="text-slate-300" />
          </div>
          <div>
            <p className="text-sm text-white font-medium">{user.username}</p>
            <p className="text-xs text-slate-500">Online</p>
          </div>
        </div>
      </div>
    </div>
  );

  const ChatView = () => (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative no-print overflow-hidden">
      {isEmergency && (
        <div className="bg-red-600 text-white p-4 flex items-start sm:items-center justify-center gap-3 shadow-md z-10 animate-in slide-in-from-top shrink-0">
          <ShieldAlert className="shrink-0" size={24} />
          <p className="font-medium text-sm sm:text-base">
            URGENT: Your symptoms require immediate medical attention. Please visit an emergency room.
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 border border-blue-200">
                <Bot size={20} className="text-blue-600" />
              </div>
            )}

            <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none'
              : msg.type === 'emergency' ? 'bg-red-50 text-red-900 border border-red-200 rounded-bl-none'
                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
              }`}>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.text}</p>

              {msg.type === 'diagnosis' && msg.data && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <h4 className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
                    <Activity size={16} className="text-blue-500" /> Top Predicted Conditions
                  </h4>
                  <div className="space-y-3 mb-4">
                    {msg.data.predictions && msg.data.predictions.map((pred, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{pred.disease}</span>
                          <span className="text-slate-500">{pred.probability}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-blue-400/70' : 'bg-slate-300'}`}
                            style={{ width: `${pred.probability}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium text-blue-900 mb-1">Suggested Specialist:</p>
                    <p className="text-sm text-blue-800 flex items-center gap-2">
                      <Stethoscope size={16} /> {msg.data.recommendedSpecialist || 'General Practitioner'}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-900 mb-2">Care Tips & Precautions:</p>
                    <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                      {msg.data.diseaseDetails?.precautions?.map((tip, i) => <li key={`prec-${i}`}>{tip}</li>)}
                      {msg.data.careTips?.map((tip, i) => <li key={`gemini-${i}`}>{tip}</li>)}
                    </ul>
                  </div>

                  <button
                    onClick={() => setActiveView(`report-${msg.id}`)}
                    className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <FileText size={16} /> Generate PDF Report
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isAnalyzing && (
          <div className="flex gap-4 justify-start">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 border border-blue-200">
              <Bot size={20} className="text-blue-600" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-2 text-slate-500">
              <Loader2 size={16} className="animate-spin text-blue-500" />
              <span className="ml-2 text-sm">AI Medical Assistant is typing...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200 shrink-0 shadow-md">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isAnalyzing || isEmergency}
            placeholder={isEmergency ? "Emergency triggered. Input disabled." : "Reply to the AI..."}
            className="w-full bg-slate-100 border border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl px-5 py-4 pr-16 outline-none transition-all disabled:opacity-50 text-slate-800"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isAnalyzing || isEmergency}
            className="absolute right-2 top-2 bottom-2 my-auto px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg transition-colors flex items-center justify-center cursor-pointer"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );

  const ReportView = ({ msgId }) => {
    const reportData = messages.find(m => m.id === parseInt(msgId))?.data;
    const userMsg = messages[messages.findIndex(m => m.id === parseInt(msgId)) - 1]?.text;

    if (!reportData) return null;

    return (
      <div className="flex-1 flex flex-col h-full bg-slate-200 p-4 md:p-8 overflow-y-auto items-center print:bg-white print:p-0 print:overflow-visible">
        <div className="w-full max-w-3xl flex justify-between items-center mb-6 no-print shrink-0">
          <button onClick={() => setActiveView('chat')} className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-2 cursor-pointer">
            <ChevronRight className="rotate-180" size={20} /> Back to Chat
          </button>
          <button onClick={generatePDF} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors cursor-pointer">
            <Download size={18} /> Download as PDF
          </button>
        </div>

        <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl p-8 md:p-12 border border-slate-300 flex flex-col my-auto sm:my-4 print:shadow-none print:border-none print:p-0 print:m-0 print:w-full print:max-w-none print:rounded-none">
          <div className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Medical Summary</h1>
              <p className="text-slate-500 mt-1">Generated by DSAI Capstone System</p>
            </div>
            <div className="text-right text-sm text-slate-500">
              <p>Date: {new Date().toLocaleDateString()}</p>
              <p>Consultation ID: #{reportData.consultationId?.slice(-6) || '10294'}</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-3 uppercase tracking-wider text-sm border-l-4 border-blue-500 pl-3">1. Patient Reported Symptoms</h2>
            <div className="bg-slate-50 p-4 rounded-md border border-slate-100">
              <p className="text-slate-700 italic">"{userMsg}"</p>
              {reportData.extractedSymptoms && reportData.extractedSymptoms.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {reportData.extractedSymptoms.map(s => (
                    <span key={s} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">NLP Extracted: {s}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-3 uppercase tracking-wider text-sm border-l-4 border-blue-500 pl-3">2. Differential Diagnosis (ML Predictions)</h2>
            <table className="w-full border-collapse mb-4">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-2 text-left">Condition</th>
                  <th className="border border-slate-300 p-2 text-left">Probability</th>
                </tr>
              </thead>
              <tbody>
                {reportData.predictions && reportData.predictions.length > 0 ? (
                  reportData.predictions.map((pred, i) => (
                    <tr key={i}>
                      <td className={`border border-slate-300 p-2 ${i === 0 ? 'font-medium' : ''}`}>{pred.disease}</td>
                      <td className={`border border-slate-300 p-2 ${i === 0 ? 'font-bold text-blue-700' : ''}`}>{pred.probability}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="border border-slate-300 p-2 text-slate-500 italic">No specific ML predictions generated</td>
                  </tr>
                )}
              </tbody>
            </table>
            {reportData.diseaseDetails?.description && (
              <p className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <span className="font-semibold text-blue-900">Database Context: </span>
                {reportData.diseaseDetails.description}
              </p>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-3 uppercase tracking-wider text-sm border-l-4 border-blue-500 pl-3">3. Next Steps & Recommendations</h2>
            <div className="mb-4">
              <p className="font-semibold text-slate-800">Suggested Specialist: <span className="font-normal text-slate-700">{reportData.recommendedSpecialist || 'General Practitioner'}</span></p>
            </div>
            <p className="font-semibold text-slate-800 mb-2">Care Guidelines & Precautions:</p>
            <ul className="list-disc pl-5 text-slate-700 space-y-1 text-sm">
              {reportData.diseaseDetails?.precautions?.map((tip, i) => <li key={`prec-${i}`}>{tip}</li>)}
              {reportData.careTips?.map((tip, i) => <li key={`tip-${i}`}>{tip}</li>)}
            </ul>
          </div>

          <div className="border-t-2 border-red-200 bg-red-50 p-4 rounded-md text-red-900 mt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="shrink-0 text-red-600" size={24} />
              <div>
                <h4 className="font-bold uppercase tracking-wider text-sm mb-1 text-red-700">Medical Disclaimer</h4>
                <p className="text-xs leading-relaxed">
                  This report is generated by an AI capstone project for educational purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return <LoginScreen onLoginSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <div className="flex h-screen w-full bg-slate-100 font-sans text-slate-900 overflow-hidden">
      {Sidebar()}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
          {activeView === 'chat' ? ChatView() : ReportView({ msgId: activeView.split('-')[1] })}
        </div>

        <footer className="h-8 bg-slate-900 flex items-center justify-center px-4 shrink-0 z-30 no-print">
          <p className="text-xs text-slate-400 flex items-center gap-2">
            <AlertTriangle size={12} className="text-yellow-500" />
            Educational purposes only. NOT professional medical advice.
          </p>
        </footer>
      </main>
    </div>
  );
}