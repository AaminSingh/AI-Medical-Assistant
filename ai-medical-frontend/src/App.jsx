import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Activity, MessageSquare, History, FileText, AlertTriangle,
  Send, Download, User, Bot, Plus, ChevronRight, ChevronLeft,
  ShieldAlert, Stethoscope, Lock, Mail, Loader2, Calculator, Apple, LogOut, LayoutDashboard
} from 'lucide-react';
import {
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

axios.defaults.withCredentials = true;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

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
      const payload = isLoginMode ? { email, password } : { email, password, username, fullName };
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
      setError(err.response?.data?.message || 'Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] bg-grid-pattern flex items-center justify-center p-4 relative overflow-hidden">
      {/* Soft light watermark background image */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.10] mix-blend-screen z-0 filter brightness-110"
        style={{ backgroundImage: `url('/backgroundimage.png')` }}
      />
      <div className="max-w-md w-full bg-[#111827]/90 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative z-10">
        <div className="p-8 text-center border-b border-slate-800">
          <div className="w-16 h-16 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Activity size={32} className="text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Aegis AI Medical</h2>
          <p className="text-slate-400 text-sm">
            {isLoginMode ? 'Sign in to your diagnostic portal' : 'Create your secure account'}
          </p>
        </div>
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className={`p-3 rounded-lg text-sm border ${error.includes('successful') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                {error}
              </div>
            )}
            {!isLoginMode && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-slate-500" size={18} />
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-[#1F2937] text-white pl-10 pr-4 py-2 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-slate-500" size={18} />
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-[#1F2937] text-white pl-10 pr-4 py-2 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#1F2937] text-white pl-10 pr-4 py-2 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#1F2937] text-white pl-10 pr-4 py-2 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer">
              {loading ? <Loader2 size={18} className="animate-spin" /> : (isLoginMode ? 'Secure Login' : 'Create Account')}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button type="button" onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer">
              {isLoginMode ? "Don't have an account? Register here" : "Already have an account? Login here"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardView = ({ setActiveView }) => {
  const accuracyData = [
    { name: 'Naive Bayes', Accuracy: 89.1 },
    { name: 'Decision Tree', Accuracy: 92.4 },
    { name: 'Random Forest', Accuracy: 96.5 },
    { name: 'XGBoost (Aegis)', Accuracy: 98.6 },
  ];

  const cohortData = [
    { name: 'Malaria', value: 16 },
    { name: 'Typhoid', value: 15 },
    { name: 'Dengue', value: 15 },
    { name: 'Jaundice', value: 14 },
    { name: 'Diabetes', value: 13 },
    { name: 'Hypertension', value: 17 },
    { name: 'Others', value: 10 },
  ];

  return (
    <div className="p-8 h-full overflow-y-auto scrollbar-dark relative z-10">
      {/* Expanded About Section */}
      <div className="mb-10 bg-gradient-to-br from-slate-900/90 via-indigo-950/40 to-[#111827] border border-indigo-500/30 p-8 md:p-10 rounded-2xl relative overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide uppercase border border-indigo-500/30 shadow-sm">
              <Activity size={14} className="animate-pulse text-indigo-400" /> AI-Powered Clinical Intelligence
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 tracking-tight leading-tight">
            Next-Generation <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-teal-300">Medical Diagnosis Portal</span>
          </h1>

          <div className="max-w-4xl text-slate-300 text-base md:text-lg mb-8 leading-relaxed space-y-3">
            <p>
              <strong className="text-white font-semibold">Aegis AI Medical Assistant</strong> is a next-generation clinical decision support system that integrates state-of-the-art Natural Language Processing (NLP) with Ensemble Machine Learning classification models to deliver real-time diagnostic insights, emergency triage, and specialist medical recommendations.
            </p>
            <p className="text-slate-400 text-sm md:text-base">
              Engineered for seamless clinical triage, Aegis AI evaluates complex user symptom descriptions, calculates accurate differential disease probabilities across 40+ disease categories, alerts users to red-flag emergencies, and generates complete, downloadable PDF medical summaries.
            </p>
          </div>

          {/* Key Features Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#111827]/80 border border-slate-800 p-5 rounded-xl hover:border-indigo-500/40 transition-colors shadow-md">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3 text-indigo-400">
                <MessageSquare size={20} />
              </div>
              <h4 className="text-white font-semibold text-base mb-1">Clinical NLP Checker</h4>
              <p className="text-slate-400 text-xs leading-relaxed">Interactive symptom dialogue probing symptoms & identifying differential medical conditions.</p>
            </div>

            <div className="bg-[#111827]/80 border border-slate-800 p-5 rounded-xl hover:border-indigo-500/40 transition-colors shadow-md">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3 text-cyan-400">
                <Activity size={20} />
              </div>
              <h4 className="text-white font-semibold text-base mb-1">98.6% Accuracy ML Engine</h4>
              <p className="text-slate-400 text-xs leading-relaxed">High-precision ensemble predictive models including XGBoost, Random Forest, & Naive Bayes.</p>
            </div>

            <div className="bg-[#111827]/80 border border-slate-800 p-5 rounded-xl hover:border-indigo-500/40 transition-colors shadow-md">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3 text-emerald-400">
                <Apple size={20} />
              </div>
              <h4 className="text-white font-semibold text-base mb-1">Diet & BMI Tools</h4>
              <p className="text-slate-400 text-xs leading-relaxed">Targeted health tools including custom dietary planner and instant Body Mass Index calculator.</p>
            </div>

            <div className="bg-[#111827]/80 border border-slate-800 p-5 rounded-xl hover:border-indigo-500/40 transition-colors shadow-md">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3 text-purple-400">
                <FileText size={20} />
              </div>
              <h4 className="text-white font-semibold text-base mb-1">Clinical PDF Reports</h4>
              <p className="text-slate-400 text-xs leading-relaxed">One-click generation of structured medical summary reports for physician consultations.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button onClick={() => setActiveView('chat')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2 cursor-pointer">
              Start Diagnosis <ChevronRight size={18} />
            </button>
            <button onClick={() => setActiveView('diet')} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3.5 rounded-xl font-medium border border-slate-700 transition-all flex items-center gap-2 cursor-pointer">
              Explore Health Tools
            </button>
            <button onClick={() => setActiveView('history')} className="bg-[#1F2937] hover:bg-slate-700 text-white px-6 py-3.5 rounded-xl font-medium border border-slate-600 transition-all flex items-center gap-2 cursor-pointer">
              View History
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Changed Chart 1: AreaChart (replaced BarChart) */}
        <div className="bg-[#111827]/90 backdrop-blur-md border border-slate-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-slate-200 mb-1">Algorithm Performance Evaluation</h3>
          <p className="text-sm text-slate-400 mb-6">Comparative model accuracy curves across validation cohorts.</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={accuracyData} margin={{ top: 10, right: 30, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="accuracyAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" domain={[80, 100]} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ stroke: '#6366f1', strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="Accuracy" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#accuracyAreaGradient)" dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#ffffff' }} activeDot={{ r: 8, fill: '#38bdf8' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Changed Chart 2: RadarChart (replaced PieChart) */}
        <div className="bg-[#111827]/90 backdrop-blur-md border border-slate-800 p-6 rounded-xl shadow-lg flex flex-col">
          <h3 className="text-lg font-semibold text-slate-200 mb-1">Dataset Diagnostic Cohorts</h3>
          <p className="text-sm text-slate-400 mb-4">Multi-axis distribution of mapped disease classes inside training set.</p>
          <div className="flex-1 flex items-center justify-center">
            <div className="h-64 w-full max-w-md">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={cohortData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 20]} stroke="#475569" tick={{ fontSize: 10 }} />
                  <Radar name="Cohort Distribution (%)" dataKey="value" stroke="#38bdf8" fill="#6366f1" fillOpacity={0.5} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BmiCalculatorView = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [category, setCategory] = useState('');

  const calculateBMI = (e) => {
    e.preventDefault();
    if (height && weight) {
      const heightInMeters = height / 100;
      const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1);
      setBmi(bmiValue);
      if (bmiValue < 18.5) setCategory('Underweight');
      else if (bmiValue >= 18.5 && bmiValue <= 24.9) setCategory('Normal Weight');
      else if (bmiValue >= 25 && bmiValue <= 29.9) setCategory('Overweight');
      else setCategory('Obese');
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto flex flex-col items-center">
      <div className="mb-10 text-center max-w-2xl mt-8">
        <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
          <Calculator size={32} />
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">BMI Index Calculator</h2>
        <p className="text-slate-400">Calculate your Body Mass Index to quickly assess healthy weight.</p>
      </div>

      <div className="max-w-md w-full bg-[#111827] border border-slate-800 p-8 rounded-2xl shadow-xl">
        <form onSubmit={calculateBMI} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Height (cm)</label>
            <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 175" className="w-full bg-[#1F2937] text-white px-4 py-3 border border-slate-700 rounded-xl outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Weight (kg)</label>
            <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 70" className="w-full bg-[#1F2937] text-white px-4 py-3 border border-slate-700 rounded-xl outline-none" required />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors cursor-pointer mt-2">Calculate BMI</button>
        </form>

        {bmi && (
          <div className="mt-8 p-6 bg-[#1F2937] border border-slate-700 rounded-xl text-center">
            <p className="text-slate-400 text-sm mb-2">Your BMI is</p>
            <p className="text-5xl font-bold text-white mb-3">{bmi}</p>
            <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold border ${category === 'Normal Weight' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
              {category}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DietPlannerView = () => {
  const [formData, setFormData] = useState({ age: '', gender: 'Male', weight: '', height: '', goal: 'Weight Loss', preference: 'Veg', allergies: '' });
  const [loading, setLoading] = useState(false);
  const [dietPlan, setDietPlan] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/diagnose/diet`, formData);
      setDietPlan(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Failed to generate diet plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto scrollbar-dark">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg"><Apple className="text-emerald-500" size={28} /></div>
          AI Diet Recommendation & Planner
        </h2>
        <p className="text-slate-400">Personalized macro targets and dynamic meal suggestions.</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="w-full xl:w-[400px] bg-[#111827] border border-slate-800 p-6 rounded-2xl shadow-lg h-fit">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Weight (kg)</label>
                <input type="number" required value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} className="w-full bg-[#1F2937] text-white px-4 py-2.5 rounded-xl border border-slate-700 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Height (cm)</label>
                <input type="number" required value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} className="w-full bg-[#1F2937] text-white px-4 py-2.5 rounded-xl border border-slate-700 outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Age</label>
                <input type="number" required value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} className="w-full bg-[#1F2937] text-white px-4 py-2.5 rounded-xl border border-slate-700 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Gender</label>
                <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full bg-[#1F2937] text-white px-4 py-2.5 rounded-xl border border-slate-700 outline-none">
                  <option>Male</option><option>Female</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Goal</label>
                <select value={formData.goal} onChange={e => setFormData({ ...formData, goal: e.target.value })} className="w-full bg-[#1F2937] text-white px-4 py-2.5 rounded-xl border border-slate-700 outline-none">
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Weight Gain">Weight Gain</option>
                  <option value="Maintain Weight">Maintain Weight</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Diet Preference</label>
                <select value={formData.preference} onChange={e => setFormData({ ...formData, preference: e.target.value })} className="w-full bg-[#1F2937] text-white px-4 py-2.5 rounded-xl border border-slate-700 outline-none">
                  <option value="Veg">Veg</option>
                  <option value="Non Veg">Non Veg</option>
                  <option value="Vegan">Vegan</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl transition-colors mt-6 flex justify-center cursor-pointer">
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Generate AI Plan'}
            </button>
          </form>
        </div>

        <div className="flex-1 bg-[#111827]/50 border border-slate-800 p-8 rounded-2xl flex flex-col min-h-[500px]">
          {!dietPlan && !loading && (
            <div className="m-auto text-center opacity-50">
              <Apple size={64} className="mx-auto mb-4 text-slate-600" />
              <p className="text-xl font-medium text-slate-300">Meal Recommendations Idle</p>
            </div>
          )}
          {loading && (
            <div className="m-auto text-center text-emerald-500">
              <Loader2 size={48} className="animate-spin mx-auto mb-4" />
              <p>Synthesizing nutritional data...</p>
            </div>
          )}
          {dietPlan && !loading && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#1F2937] p-4 rounded-xl text-center"><p className="text-xs text-slate-400">Calories</p><p className="text-xl font-bold text-emerald-400">{dietPlan.calories}</p></div>
                <div className="bg-[#1F2937] p-4 rounded-xl text-center"><p className="text-xs text-slate-400">Protein</p><p className="text-xl font-bold text-blue-400">{dietPlan.protein}</p></div>
                <div className="bg-[#1F2937] p-4 rounded-xl text-center"><p className="text-xs text-slate-400">Carbs</p><p className="text-xl font-bold text-amber-400">{dietPlan.carbs}</p></div>
                <div className="bg-[#1F2937] p-4 rounded-xl text-center"><p className="text-xs text-slate-400">Fats</p><p className="text-xl font-bold text-red-400">{dietPlan.fats}</p></div>
              </div>
              <div className="space-y-3">
                {dietPlan.meals?.map((meal, idx) => (
                  <div key={idx} className="bg-[#111827] p-4 rounded-xl border border-slate-800 flex gap-4">
                    <span className="px-3 py-1 bg-slate-800 text-emerald-400 text-xs font-bold rounded-lg uppercase">{meal.name}</span>
                    <span className="text-slate-300 text-sm">{meal.suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const HistoryView = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/diagnose/history`);
        setHistory(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="p-8 h-full flex flex-col">
      <h2 className="text-3xl font-bold text-white mb-6">Consultation History</h2>
      <div className="flex-1 flex gap-8 min-h-0">
        <div className="w-[400px] bg-[#111827] border border-slate-800 rounded-2xl overflow-y-auto p-4 space-y-3">
          {loading ? <p className="text-slate-500 text-center">Loading...</p> : history.map((record) => (
            <div key={record._id} onClick={() => setSelectedConsultation(record)} className={`p-4 rounded-xl border cursor-pointer ${selectedConsultation?._id === record._id ? 'bg-indigo-600/10 border-indigo-500' : 'bg-[#1F2937] border-slate-700'}`}>
              <p className="text-xs text-slate-400">{new Date(record.createdAt).toLocaleString()}</p>
              <h4 className="font-bold text-white mt-1">{record.predictions?.[0]?.disease || 'Consultation'}</h4>
            </div>
          ))}
        </div>
        <div className="flex-1 bg-[#111827] border border-slate-800 rounded-2xl p-8 overflow-y-auto">
          {!selectedConsultation ? <p className="text-slate-500 text-center mt-20">Select a record to view details.</p> : (
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Report Details</h3>
              <p className="text-slate-300 mb-4">"{selectedConsultation.rawSymptoms}"</p>
              <div className="space-y-3">
                {selectedConsultation.predictions?.map((p, i) => (
                  <div key={i} className="bg-[#1F2937] p-3 rounded-lg flex justify-between">
                    <span className="text-white">{p.disease}</span>
                    <span className="text-indigo-400 font-bold">{p.probability}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ReportView = ({ reportData, userMsg, onBack }) => {
  const generatePDF = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B1120] p-8 overflow-y-auto items-center">
      <div className="w-full max-w-3xl flex justify-between items-center mb-6 no-print">
        <button onClick={onBack} className="text-slate-400 hover:text-white font-medium flex items-center gap-2 cursor-pointer">
          <ChevronLeft size={20} /> Back to Chat
        </button>
        <button onClick={generatePDF} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm cursor-pointer">
          <Download size={18} /> Download as PDF
        </button>
      </div>

      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl p-12 text-slate-900 border border-slate-300 print:shadow-none print:border-none print:p-0">
        <div className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Medical Summary</h1>
            <p className="text-slate-500 mt-1">Generated by Aegis AI Diagnostic Platform</p>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p>Date: {new Date().toLocaleDateString()}</p>
            <p>Consultation ID: #{reportData?.consultationId?.slice(-6) || '10294'}</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3 uppercase tracking-wider text-sm border-l-4 border-indigo-600 pl-3">1. Patient Reported Symptoms</h2>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="italic text-slate-700">"{userMsg}"</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {reportData?.extractedSymptoms?.map(s => (
                <span key={s} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">NLP Extracted: {s}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3 uppercase tracking-wider text-sm border-l-4 border-indigo-600 pl-3">2. Differential Diagnosis (ML Predictions)</h2>
          <table className="w-full border-collapse mb-4">
            <thead>
              <tr className="bg-slate-100 text-left">
                <th className="border border-slate-300 p-3">Condition</th>
                <th className="border border-slate-300 p-3">Probability</th>
              </tr>
            </thead>
            <tbody>
              {reportData?.predictions?.map((pred, i) => (
                <tr key={i}>
                  <td className={`border border-slate-300 p-3 ${i === 0 ? 'font-semibold' : ''}`}>{pred.disease}</td>
                  <td className={`border border-slate-300 p-3 ${i === 0 ? 'font-bold text-indigo-600' : ''}`}>{pred.probability}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3 uppercase tracking-wider text-sm border-l-4 border-indigo-600 pl-3">3. Next Steps & Recommendations</h2>
          <p className="font-semibold text-slate-800 mb-2">Suggested Specialist: <span className="font-normal text-slate-700">{reportData?.recommendedSpecialist || 'General Practitioner'}</span></p>
          <p className="font-semibold text-slate-800 mb-2">Care Guidelines & Precautions:</p>
          <ul className="list-disc pl-5 text-slate-700 space-y-1 text-sm">
            {reportData?.diseaseDetails?.precautions?.map((tip, i) => <li key={`prec-${i}`}>{tip}</li>)}
            {reportData?.careTips?.map((tip, i) => <li key={`tip-${i}`}>{tip}</li>)}
          </ul>
        </div>

        <div className="mt-12 border-2 border-red-200 bg-red-50 p-5 rounded-xl text-red-900">
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

const ChatView = ({ user, onOpenReport }) => {
  const [inputValue, setInputValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hello ${user?.fullName || user?.username || ''}. I am Aegis AI. Please describe your symptoms in detail so I can help triage your condition.`, type: 'text' }
  ]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAnalyzing]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newHistory = [...messages, { role: 'user', content: inputValue, type: 'text' }];
    setMessages(newHistory);
    setInputValue('');
    setIsAnalyzing(true);
    setIsEmergency(false);

    try {
      const response = await axios.post(`${API_BASE_URL}/diagnose`, {
        messages: newHistory.map(m => ({ role: m.role, content: m.content }))
      });
      const { data } = response.data;

      if (data.isEmergency) {
        setIsEmergency(true);
        setMessages(prev => [...prev, { role: 'assistant', content: data.message, type: 'emergency' }]);
      } else if (data.type === 'question') {
        setMessages(prev => [...prev, { role: 'assistant', content: data.text, type: 'text' }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'I have gathered enough details and analyzed your symptoms using our medical ML engine. Here is your differential diagnosis:',
          type: 'diagnosis',
          data: data,
          userSymptoms: newHistory.filter(m => m.role === 'user').map(m => m.content).join(' | ')
        }]);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Connection problem.";
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${errorMsg}`, type: 'text' }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#0f172a]">
      {isEmergency && (
        <div className="bg-red-500/10 border-b border-red-500/20 p-4 flex items-start gap-4 shadow-sm z-10 shrink-0">
          <div className="p-2 bg-red-500/20 rounded-full shrink-0 mt-1"><ShieldAlert size={20} className="text-red-500" /></div>
          <div>
            <h3 className="text-red-500 font-bold uppercase tracking-wide text-sm mb-1">Urgent Medical Alert</h3>
            <p className="text-red-400 text-sm">Red-flag symptoms detected. Please visit an emergency room immediately.</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-dark max-w-4xl mx-auto w-full">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-1">
                <Bot size={20} className="text-indigo-400" />
              </div>
            )}

            <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-5 shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm'
              : msg.type === 'emergency' ? 'bg-[#1e293b] text-slate-200 border border-slate-700 rounded-tl-sm'
                : 'bg-[#1e293b] text-slate-200 border border-slate-700 rounded-tl-sm'
              }`}>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.content}</p>

              {msg.type === 'diagnosis' && msg.data && (
                <div className="mt-6 border-t border-slate-700 pt-6">
                  <h4 className="font-semibold text-white flex items-center gap-2 mb-4">
                    <Activity size={18} className="text-indigo-400" /> Top Predicted Conditions
                  </h4>
                  <div className="space-y-4 mb-6">
                    {msg.data.predictions?.map((pred, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-medium text-slate-200">{pred.disease}</span>
                          <span className="text-slate-400">{pred.probability}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${idx === 0 ? 'bg-indigo-500' : 'bg-slate-600'}`} style={{ width: `${pred.probability}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-5">
                    <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">Suggested Specialist</p>
                    <p className="text-sm text-indigo-200 flex items-center gap-2">
                      <Stethoscope size={16} /> {msg.data.recommendedSpecialist || 'General Practitioner'}
                    </p>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm font-semibold text-white mb-2">Care Tips & Precautions:</p>
                    <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1.5">
                      {msg.data.diseaseDetails?.precautions?.map((tip, i) => <li key={`prec-${i}`}>{tip}</li>)}
                      {msg.data.careTips?.map((tip, i) => <li key={`gemini-${i}`}>{tip}</li>)}
                    </ul>
                  </div>

                  <button onClick={() => onOpenReport(msg.data, msg.userSymptoms)} className="w-full bg-[#111827] border border-slate-700 hover:bg-slate-800 text-white py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm">
                    <FileText size={16} /> Generate PDF Report
                  </button>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-1 shadow-md">
                <User size={18} className="text-white" />
              </div>
            )}
          </div>
        ))}

        {isAnalyzing && (
          <div className="flex gap-4 justify-start">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-1">
              <Bot size={20} className="text-indigo-400" />
            </div>
            <div className="bg-[#1e293b] border border-slate-700 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center gap-3 text-slate-400">
              <Loader2 size={16} className="animate-spin text-indigo-400" />
              <span className="text-sm">Aegis AI is analyzing symptoms...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} className="h-4" />
      </div>

      <div className="p-4 bg-[#111827] border-t border-slate-800 shrink-0">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isAnalyzing || isEmergency}
            placeholder={isEmergency ? "Emergency triggered." : "Describe symptoms or answer follow-up questions..."}
            className="w-full bg-[#1e293b] border border-slate-700 focus:border-indigo-500 rounded-full px-6 py-3.5 pr-14 outline-none text-slate-200 placeholder:text-slate-500"
          />
          <button type="submit" disabled={!inputValue.trim() || isAnalyzing || isEmergency} className="absolute right-2 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 text-white rounded-full flex items-center justify-center cursor-pointer">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aegis_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [activeView, setActiveView] = useState('dashboard');
  const [chatSessionId, setChatSessionId] = useState(Date.now());
  const [activeReportData, setActiveReportData] = useState(null);

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('aegis_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`);
    } catch (e) { console.error(e); }
    localStorage.removeItem('aegis_user');
    setUser(null);
  };

  const handleNewConsultation = () => {
    setChatSessionId(Date.now());
    setActiveReportData(null);
    setActiveView('chat');
  };

  if (!user) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#0B1120] text-slate-300 font-sans overflow-hidden relative">
      {/* Soft light watermark background image */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.10] mix-blend-screen z-0 filter brightness-110"
        style={{ backgroundImage: `url('/backgroundimage.png')` }}
      />
      <aside className="w-64 bg-[#111827] border-r border-slate-800 flex flex-col h-full shrink-0 z-20">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 shrink-0">
          <Activity className="text-indigo-500" size={24} />
          <span className="text-xl font-bold text-white tracking-tight">Aegis <span className="text-indigo-500">AI</span></span>
        </div>

        <nav className="p-4 flex-1 overflow-y-auto space-y-1.5">
          <button onClick={handleNewConsultation} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl transition-colors mb-6 font-semibold shadow-lg shadow-indigo-900/20 cursor-pointer">
            <Plus size={18} /> New Consultation
          </button>

          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-3">Platform</p>
          <button onClick={() => setActiveView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium ${activeView === 'dashboard' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button onClick={() => setActiveView('chat')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium ${activeView === 'chat' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
            <MessageSquare size={18} /> Symptom Checker
          </button>
          <button onClick={() => setActiveView('history')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium ${activeView === 'history' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
            <History size={18} /> Consultations
          </button>

          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-3 mt-6">Health Tools</p>
          <button onClick={() => setActiveView('diet')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium ${activeView === 'diet' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
            <Apple size={18} /> Diet Planner
          </button>
          <button onClick={() => setActiveView('bmi')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium ${activeView === 'bmi' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
            <Calculator size={18} /> BMI Index
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-[#0B1120]/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 bg-indigo-900/50 rounded-full flex items-center justify-center shrink-0 border border-indigo-500/30">
                <User size={16} className="text-indigo-300" />
              </div>
              <div className="truncate">
                <p className="text-sm text-slate-200 font-medium truncate">{user.username}</p>
                <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">Online</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 p-2 transition-colors cursor-pointer bg-slate-800/50 rounded-lg">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-1 flex-col relative overflow-hidden bg-grid-pattern">
        {activeView !== 'dashboard' && (
          <header className="h-14 bg-[#111827]/80 backdrop-blur-md border-b border-slate-800 flex items-center px-6 shrink-0 z-10 no-print">
            <button onClick={() => setActiveView('dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors text-sm font-medium cursor-pointer">
              <ChevronLeft size={18} /> Back to Dashboard
            </button>
          </header>
        )}

        <div className="flex-1 overflow-hidden relative">
          {activeView === 'dashboard' && <DashboardView setActiveView={setActiveView} />}
          {activeView === 'chat' && !activeReportData && <ChatView key={chatSessionId} user={user} onOpenReport={(data, symptoms) => { setActiveReportData({ data, symptoms }); setActiveView('report'); }} />}
          {activeView === 'report' && activeReportData && <ReportView reportData={activeReportData.data} userMsg={activeReportData.symptoms} onBack={() => setActiveView('chat')} />}
          {activeView === 'history' && <HistoryView />}
          {activeView === 'diet' && <DietPlannerView />}
          {activeView === 'bmi' && <BmiCalculatorView />}
        </div>
      </main>
    </div>
  );
}