import React, { useState } from 'react';
import { User, Phone, MapPin, Hash, ArrowRight, Shield, AlertCircle } from 'lucide-react';
import { saveParticipant } from '../utils/storage';

export default function Registration({ onCompleteRegistration, initialData }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    candidateCode: initialData?.candidateCode || initialData?.participantId || '',
    place: initialData?.place || initialData?.institution || '',
    mobileNumber: initialData?.mobileNumber || initialData?.phone || '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'candidateCode' ? value.toUpperCase() : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // 1. Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // 2. Candidate Code validation (candidate code is already given)
    if (!formData.candidateCode.trim()) {
      newErrors.candidateCode = 'Candidate code is required';
    } else if (formData.candidateCode.trim().length < 2) {
      newErrors.candidateCode = 'Please enter a valid candidate code';
    }

    // 3. Place validation
    if (!formData.place.trim()) {
      newErrors.place = 'Place is required';
    } else if (formData.place.trim().length < 2) {
      newErrors.place = 'Place must be at least 2 characters';
    }

    // 4. Mobile Number validation
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (formData.mobileNumber.trim().replace(/\D/g, '').length < 7) {
      newErrors.mobileNumber = 'Please enter a valid mobile number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const code = formData.candidateCode.trim();

    const saved = saveParticipant({
      name: formData.name.trim(),
      candidateCode: code,
      participantId: code,
      place: formData.place.trim(),
      institution: formData.place.trim(),
      mobileNumber: formData.mobileNumber.trim(),
      phone: formData.mobileNumber.trim(),
    });

    onCompleteRegistration(saved);
  };

  return (
    <div className="max-w-lg mx-auto px-3.5 sm:px-4 py-5 sm:py-8 animate-fadeIn">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-5 sm:mb-6 px-1">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-600 text-white text-[11px] sm:text-xs font-bold flex items-center justify-center shrink-0">1</span>
          <span className="text-[10px] sm:text-xs font-bold text-emerald-950 uppercase tracking-wider">Registration</span>
        </div>
        <div className="h-0.5 flex-1 mx-2 sm:mx-3 bg-emerald-200"></div>
        <div className="flex items-center gap-1.5 sm:gap-2 opacity-50">
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-200 text-slate-600 text-[11px] sm:text-xs font-bold flex items-center justify-center shrink-0">2</span>
          <span className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider hidden xs:inline">Instructions</span>
        </div>
        <div className="h-0.5 flex-1 mx-2 sm:mx-3 bg-slate-200"></div>
        <div className="flex items-center gap-1.5 sm:gap-2 opacity-50">
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-200 text-slate-600 text-[11px] sm:text-xs font-bold flex items-center justify-center shrink-0">3</span>
          <span className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider hidden xs:inline">Quiz</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-sm border border-emerald-100">
        <div className="mb-5 sm:mb-6">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">Registration Details</h1>
            <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-right shrink-0">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Step 1 of 3</span>
            </div>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
            Please enter your registration details to begin the Rabee Quiz.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
          {/* 1. Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={`w-full pl-10 pr-3 py-2.5 rounded-xl border text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.name
                    ? 'border-rose-300 bg-rose-50/40 focus:ring-rose-200'
                    : 'border-slate-200 bg-slate-50/50 focus:border-emerald-500 focus:bg-white focus:ring-emerald-100'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" /> {errors.name}
              </p>
            )}
          </div>

          {/* 2. Candidate Code */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Candidate Code <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] sm:text-[11px] text-slate-400">Enter provided code</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Hash className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="candidateCode"
                value={formData.candidateCode}
                onChange={handleChange}
                placeholder="Enter your candidate code"
                className={`w-full pl-10 pr-3 py-2.5 rounded-xl border text-base sm:text-sm font-mono uppercase text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.candidateCode
                    ? 'border-rose-300 bg-rose-50/40 focus:ring-rose-200'
                    : 'border-slate-200 bg-slate-50/50 focus:border-emerald-500 focus:bg-white focus:ring-emerald-100 font-semibold'
                }`}
              />
            </div>
            {errors.candidateCode && (
              <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" /> {errors.candidateCode}
              </p>
            )}
          </div>

          {/* 3. Place */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Place <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="place"
                value={formData.place}
                onChange={handleChange}
                placeholder="Enter your place / town"
                className={`w-full pl-10 pr-3 py-2.5 rounded-xl border text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.place
                    ? 'border-rose-300 bg-rose-50/40 focus:ring-rose-200'
                    : 'border-slate-200 bg-slate-50/50 focus:border-emerald-500 focus:bg-white focus:ring-emerald-100'
                }`}
              />
            </div>
            {errors.place && (
              <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" /> {errors.place}
              </p>
            )}
          </div>

          {/* 4. Mobile Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Mobile Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                placeholder="Enter your mobile number"
                className={`w-full pl-10 pr-3 py-2.5 rounded-xl border text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.mobileNumber
                    ? 'border-rose-300 bg-rose-50/40 focus:ring-rose-200'
                    : 'border-slate-200 bg-slate-50/50 focus:border-emerald-500 focus:bg-white focus:ring-emerald-100'
                }`}
              />
            </div>
            {errors.mobileNumber && (
              <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" /> {errors.mobileNumber}
              </p>
            )}
          </div>

          <div className="pt-2.5 sm:pt-3">
            <button
              type="submit"
              className="w-full min-h-[48px] py-3 px-5 rounded-xl font-bold text-sm text-white bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] transition-all shadow-md shadow-emerald-800/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue to Instructions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          The 10-minute timer will NOT start until you click "Start Quiz".
        </p>
      </div>
    </div>
  );
}
