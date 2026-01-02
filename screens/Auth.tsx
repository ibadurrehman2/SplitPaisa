
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { Smartphone, ChevronRight, ArrowLeft, User as UserIcon } from 'lucide-react';

interface AuthProps {
  users: User[];
  onLogin: (user: User) => void;
}

export default function Auth({ users, onLogin }: AuthProps) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'intro' | 'phone' | 'otp' | 'name'>('intro');
  
  // Refs for OTP inputs to handle auto-focus
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  const handleNext = () => {
    if (step === 'intro') {
      setStep('phone');
    } else if (step === 'phone' && phone.length === 10) {
      setStep('otp');
    } else if (step === 'otp' && otp.length === 4) {
      const existingUser = users.find(u => u.phone === phone);
      if (existingUser) {
        onLogin(existingUser);
      } else {
        setStep('name');
      }
    } else if (step === 'name' && name.trim().length >= 2) {
      onLogin({
        id: 'u-' + Math.random().toString(36).substr(2, 9),
        name: name.trim(),
        phone: phone,
        avatar: '' // Set to empty string so Profile page can show initials placeholder
      });
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const newOtpArr = otp.split('');
    // Fill with empty strings if array is shorter than 4
    while(newOtpArr.length < 4) newOtpArr.push('');
    
    newOtpArr[index] = value;
    const finalOtp = newOtpArr.join('').slice(0, 4);
    setOtp(finalOtp);

    // Auto-focus logic: Move forward
    if (value !== '' && index < 3) {
      otpRefs[index + 1].current?.focus();
    }

    // Auto-verify if 4 digits are entered
    if (finalOtp.length === 4 && index === 3 && value !== '') {
      setTimeout(() => {
        const existingUser = users.find(u => u.phone === phone);
        if (existingUser) onLogin(existingUser);
        else setStep('name');
      }, 200);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Auto-focus logic: Move backward on Backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const renderIntro = () => (
    <div className="flex flex-col h-full items-center justify-center space-y-12 animate-in fade-in duration-700">
      <div className="space-y-6 text-center">
        <div className="w-24 h-24 bg-indigo-600 rounded-[40px] flex items-center justify-center shadow-2xl shadow-indigo-100 mx-auto">
          <span className="text-white text-5xl font-black">₹</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">SplitPaisa</h1>
          <p className="text-slate-500 font-medium px-8 text-lg">Split bills with anyone, anywhere in India.</p>
        </div>
      </div>
      <div className="w-full pt-12">
        <button 
          onClick={() => setStep('phone')}
          className="w-full bg-indigo-600 text-white py-5 rounded-[32px] font-black text-xl flex items-center justify-center space-x-2 shadow-xl shadow-indigo-100 transition-all active:scale-95"
        >
          <span>Get Started</span>
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );

  const renderPhoneInput = () => (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-3">
        <div className="w-16 h-16 bg-indigo-600 rounded-[24px] flex items-center justify-center shadow-lg shadow-indigo-50 mb-6">
          <span className="text-white text-2xl font-black">₹</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">What's your number?</h2>
        <p className="text-slate-400 font-medium">We'll send a 4-digit OTP to your number.</p>
      </div>

      <div className="flex items-center bg-slate-50 border border-slate-100 p-5 rounded-3xl space-x-4 focus-within:border-indigo-600 focus-within:bg-white transition-all shadow-sm">
        <div className="flex items-center space-x-2 pr-4 border-r border-slate-200 font-bold text-slate-500">
          <span className="text-lg">🇮🇳</span>
          <span className="text-lg">+91</span>
        </div>
        <input 
          type="tel" 
          placeholder="99999 99999"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
          className="bg-transparent flex-1 outline-none text-xl font-bold tracking-[0.1em] placeholder:text-slate-200 text-slate-900"
          autoFocus
        />
      </div>
    </div>
  );

  const renderOTPInput = () => (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-3">
        <div className="w-16 h-16 bg-indigo-600 rounded-[24px] flex items-center justify-center shadow-lg shadow-indigo-50 mb-6">
          <span className="text-white text-2xl font-black">₹</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">Verify your phone</h2>
        <p className="text-slate-400 font-medium">Enter the 4-digit code sent to +91 {phone}</p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between space-x-3">
          {[...Array(4)].map((_, i) => (
            <input
              key={i}
              ref={otpRefs[i]}
              type="tel"
              maxLength={1}
              className="w-16 h-20 bg-slate-50 border border-slate-100 rounded-3xl text-center text-3xl font-black outline-none focus:border-indigo-600 focus:bg-white focus:shadow-lg focus:shadow-indigo-50 transition-all text-slate-900"
              value={otp[i] || ''}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(i, e)}
              autoFocus={i === 0}
            />
          ))}
        </div>
        <button className="text-indigo-600 font-bold text-sm tracking-wide active:opacity-60 transition-opacity">
          Resend OTP in 30s
        </button>
      </div>
    </div>
  );

  const renderNameInput = () => (
    <div className="space-y-10 animate-in zoom-in-95 duration-300">
      <div className="space-y-3">
        <div className="w-16 h-16 bg-indigo-600 rounded-[24px] flex items-center justify-center shadow-lg shadow-indigo-50 mb-6">
          <UserIcon className="text-white w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">Almost there!</h2>
        <p className="text-slate-400 font-medium">What should we call you? Your friends will see this name.</p>
      </div>

      <div className="flex items-center bg-slate-50 border border-slate-100 p-5 rounded-3xl space-x-4 focus-within:border-indigo-600 focus-within:bg-white transition-all shadow-sm">
        <UserIcon className="w-6 h-6 text-slate-300" />
        <input 
          type="text" 
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-transparent flex-1 outline-none text-xl font-bold placeholder:text-slate-200 text-slate-900"
          autoFocus
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white p-8 overflow-hidden">
      {step !== 'intro' && (
        <button 
          onClick={() => {
            if (step === 'name') setStep('otp');
            else if (step === 'otp') setStep('phone');
            else setStep('intro');
          }}
          className="p-2 -ml-2 text-slate-400 hover:text-slate-600 transition-colors w-fit"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      )}

      {step === 'intro' ? (
        renderIntro()
      ) : (
        <div className="flex flex-col h-full justify-between pb-4 pt-8">
          {step === 'phone' && renderPhoneInput()}
          {step === 'otp' && renderOTPInput()}
          {step === 'name' && renderNameInput()}

          <button 
            onClick={handleNext}
            disabled={
              (step === 'phone' && phone.length !== 10) || 
              (step === 'otp' && otp.length !== 4) ||
              (step === 'name' && name.trim().length < 2)
            }
            className="w-full bg-indigo-600 disabled:bg-slate-200 text-white py-5 rounded-[32px] font-black text-lg flex items-center justify-center space-x-2 shadow-xl shadow-indigo-100 transition-all active:scale-95"
          >
            <span>
              {step === 'phone' ? 'Continue' : step === 'otp' ? 'Verify Code' : 'Complete Profile'}
            </span>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
