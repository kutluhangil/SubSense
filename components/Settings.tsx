import React, { useState } from 'react';
import { User, Bell, Shield, Moon, Sun, Monitor, Camera, Save } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-500 text-sm mt-1">Manage your account preferences and configurations.</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <User className="text-gray-400" size={20} />
          <h3 className="text-base font-semibold text-gray-900">Profile Information</h3>
        </div>
        <div className="p-6 space-y-6">
           <div className="flex items-center gap-6">
             <div className="relative group cursor-pointer">
               <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                 <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Profile" className="w-full h-full object-cover" />
               </div>
               <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Camera className="text-white" size={20} />
               </div>
             </div>
             <div>
               <h4 className="font-medium text-gray-900">Profile Photo</h4>
               <p className="text-sm text-gray-500 mb-2">This will be displayed on your profile.</p>
               <div className="flex gap-3">
                 <button className="text-sm font-medium text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">Change</button>
                 <button className="text-sm font-medium text-red-600 hover:text-red-700 px-2 py-1.5">Remove</button>
               </div>
             </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
               <label className="text-sm font-medium text-gray-700">Full Name</label>
               <input type="text" defaultValue="Alex Morgan" className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900" />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium text-gray-700">Email Address</label>
               <input type="email" defaultValue="alex.morgan@example.com" className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900" />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium text-gray-700">Phone Number</label>
               <input type="tel" defaultValue="+1 (555) 123-4567" className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900" />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium text-gray-700">Job Title</label>
               <input type="text" defaultValue="Product Designer" className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900" />
             </div>
           </div>
        </div>
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end">
          <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>

      {/* Notifications & Appearance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <Bell className="text-gray-400" size={20} />
            <h3 className="text-base font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Payment Due</h4>
                <p className="text-xs text-gray-500">Get notified 3 days before payment.</p>
              </div>
              <Toggle defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Weekly Summary</h4>
                <p className="text-xs text-gray-500">Receive a weekly digest of spending.</p>
              </div>
              <Toggle defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">New Features</h4>
                <p className="text-xs text-gray-500">Updates about the platform.</p>
              </div>
              <Toggle />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <Monitor className="text-gray-400" size={20} />
            <h3 className="text-base font-semibold text-gray-900">Appearance</h3>
          </div>
          <div className="p-6">
             <div className="grid grid-cols-3 gap-4">
               <button className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-gray-900 bg-gray-50">
                 <Sun size={24} className="text-gray-900" />
                 <span className="text-sm font-medium text-gray-900">Light</span>
               </button>
               <button className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                 <Moon size={24} className="text-gray-400" />
                 <span className="text-sm font-medium text-gray-500">Dark</span>
               </button>
               <button className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                 <Monitor size={24} className="text-gray-400" />
                 <span className="text-sm font-medium text-gray-500">System</span>
               </button>
             </div>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <Shield className="text-gray-400" size={20} />
          <h3 className="text-base font-semibold text-gray-900">Security</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between py-2">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Change Password</h4>
              <p className="text-xs text-gray-500">Update your password regularly to stay safe.</p>
            </div>
            <button className="text-sm font-medium text-gray-700 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">Update</button>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-gray-50 pt-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-xs text-gray-500">Add an extra layer of security to your account.</p>
            </div>
            <Toggle />
          </div>
        </div>
      </div>
    </div>
  );
}

const Toggle = ({ defaultChecked = false }: { defaultChecked?: boolean }) => {
  const [enabled, setEnabled] = useState(defaultChecked);
  return (
    <button 
      onClick={() => setEnabled(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-gray-900' : 'bg-gray-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
};