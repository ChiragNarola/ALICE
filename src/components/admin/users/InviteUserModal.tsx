import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Listbox, Transition } from '@headlessui/react';
import { XMarkIcon,CheckIcon, ChevronUpDownIcon ,UserPlusIcon, ArrowUpTrayIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { inviteSingleUser, inviteBulkUsers, getNursery, type InviteUserPayload } from '../../../api/api-services';
import type { NurseryDTO } from '../../../routes/models/response/Response';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';
import EmailPreview from './EmailPreview';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InviteUserModal({ isOpen, onClose, onSuccess }: InviteUserModalProps) {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const roleOptions = [
    { id: 'parent', name: 'Parent' },
    { id: 'staff', name: 'Staff' },
    { id: 'admin', name: 'Admin' }
  ];
  // Single Invite State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['parent']);
  const [contactNumber, setContactNumber] = useState('');
  const [location, setLocation] = useState('');
  const [nurseries, setNurseries] = useState<NurseryDTO[]>([]);
  const [nurseryId, setNurseryId] = useState<number | ''>('');

  // Bulk Invite State
  const [file, setFile] = useState<File | null>(null);

  // Preview State
  const [showPreview, setShowPreview] = useState(false);
  const { user } = useAuth();

  const resetState = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setSelectedRoles(['parent']);
    setContactNumber('');
    setLocation('');
    setNurseryId('');
    setFile(null);
    setError(null);
    setLoading(false);
    setActiveTab('single');
    setShowPreview(false);
  };

  useEffect(() => {
    if (isOpen) {
      const fetchNurseries = async () => {
        try {
          const response = await getNursery();
          if (response.IsSuccess && response.Data) {
            setNurseries(response.Data);
          }
        } catch (error) {
          toast.error("Failed to fetch nurseries.");
        }
      };
      fetchNurseries();
    }
  }, [isOpen]);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || selectedRoles.length === 0 || !contactNumber || !location) {
      setError("Please fill in all fields.");
      return;
    }
    if (selectedRoles.includes('staff') && !nurseryId) {
      setError("Please select a nursery for the staff member.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload: InviteUserPayload = {
        email,
        first_name: firstName,
        last_name: lastName,
        contact_number: contactNumber,
        location,
        role: selectedRoles
      };
      if (selectedRoles.includes('staff') && nurseryId) {
        const selectedNursery = nurseries.find(n => n.id === nurseryId);
        if (selectedNursery == null) {
          throw new Error("Invalid nursery selected");
        }
        payload.nursery = selectedNursery.nursery_name;
      }
      const response = await inviteSingleUser(payload);
      if (response.IsSuccess) {
        onSuccess();
        handleClose();
      } else {
        setError(response.Message || "Failed to invite user");
      }
    } catch (err: any) {
      setError(err.Message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith('.csv')) {
        setError("Please upload a valid CSV file.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a CSV file to upload.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await inviteBulkUsers(formData);
      if (response.IsSuccess) {
        onSuccess();
        handleClose();
      } else {
        setError(response.Message || "Failed to process bulk invite.");
      }
    } catch (err: any) {
      setError(err.Message || "An unexpected error occurred during upload.");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "email,first_name,last_name,contact_number,location,role,nursery_id\njohn@example.com,John,Doe,1234567890,London,parent,\njane@example.com,Jane,Smith,0987654321,Manchester,staff,1";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "user_invite_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-visible rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                >
                  Invite Users
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-500 font-bold"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </Dialog.Title>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mt-4 mb-6">
                  <button
                    onClick={() => setActiveTab('single')}
                    className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'single'
                      ? 'border-[#134e4a] text-[#134e4a]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <UserPlusIcon className="w-4 h-4" />
                      Single Invite
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('bulk')}
                    className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'bulk'
                      ? 'border-[#134e4a] text-[#134e4a]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ArrowUpTrayIcon className="w-4 h-4" />
                      Bulk Upload
                    </div>
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-100">
                    {error}
                  </div>
                )}

                {/* Single Tab Content */}
                {activeTab === 'single' && (
                  <form onSubmit={handleSingleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:border-[#134e4a] focus:ring-1 focus:ring-[#134e4a] outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:border-[#134e4a] focus:ring-1 focus:ring-[#134e4a] outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:border-[#134e4a] focus:ring-1 focus:ring-[#134e4a] outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                        <input
                          type="text"
                          value={contactNumber}
                          onChange={(e) => setContactNumber(e.target.value)}
                          className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:border-[#134e4a] focus:ring-1 focus:ring-[#134e4a] outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:border-[#134e4a] focus:ring-1 focus:ring-[#134e4a] outline-none"
                          required
                        />
                      </div>
                    </div>

                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>

                      <Listbox value={selectedRoles} onChange={setSelectedRoles} multiple>
                        {({ open }) => (
                          <div className="relative">

                            {/* Button */}
                            <Listbox.Button className="relative w-full px-4 py-3 text-left border rounded-lg">
                              <span className="block truncate">
                                {selectedRoles.length > 0
                                  ? roleOptions
                                    .filter(r => selectedRoles.includes(r.id))
                                    .map(r => r.name)
                                    .join(", ")
                                  : "Select role"}
                              </span>

                              <span className="absolute inset-y-0 right-3 flex items-center">
                                <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
                              </span>
                            </Listbox.Button>

                            {/* Dropdown */}
                            <Transition
                              as={Fragment}
                              show={open}
                              leave="transition ease-in duration-100"
                              leaveFrom="opacity-100"
                              leaveTo="opacity-0"
                            >
                              <Listbox.Options className="absolute z-50 mt-2 w-full max-h-60 overflow-auto rounded-lg bg-white border shadow-lg">

                                {roleOptions.map((role) => (
                                  <Listbox.Option
                                    key={role.id}
                                    value={role.id}
                                    className={({ active }) =>
                                      `cursor-pointer select-none py-2 px-4 ${active
                                        ? "bg-alice-teal text-white"
                                        : "text-gray-700"
                                      }`
                                    }
                                  >
                                    {({ selected, active }) => (
                                      <div className="flex justify-between">
                                        <span>{role.name}</span>

                                        {selected && (
                                          <CheckIcon
                                            className={`w-5 h-5 ${active ? "text-white" : "text-green-600"
                                              }`}
                                          />
                                        )}
                                      </div>
                                    )}
                                  </Listbox.Option>
                                ))}

                              </Listbox.Options>
                            </Transition>
                          </div>
                        )}
                      </Listbox>
                    </>

                    {selectedRoles.includes('staff') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nursery</label>
                        <select
                          value={nurseryId}
                          onChange={(e) => setNurseryId(e.target.value ? Number(e.target.value) : '')}
                          className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:border-[#134e4a] focus:ring-1 focus:ring-[#134e4a] outline-none"
                          required
                        >
                          <option value="">Select a nursery</option>
                          {nurseries.map((nursery) => (
                            <option key={nursery.id} value={nursery.id}>
                              {nursery.nursery_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-6">
                      <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className="text-sm font-medium text-[#134e4a] hover:underline flex items-center gap-1"
                      >
                        <DocumentTextIcon className="w-4 h-4" />
                        {showPreview ? 'Hide Email Preview' : 'Show Email Preview'}
                      </button>
                    </div>

                    {showPreview && (
                      <EmailPreview
                        userName={firstName || '[User Name]'}
                        inviterName={user ? `${user.firstName} ${user.lastName}` : 'An Alice Admin'}
                        joinUrl="https://alice-platform.com/signup/..."
                        temporaryPassword="jCOJi5upL8o"
                      />
                    )}

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center rounded-lg bg-[#134e4a] px-4 py-2 text-sm font-medium text-white hover:bg-[#0f3e3b] focus:outline-none focus:ring-2 focus:ring-[#134e4a] focus:ring-offset-2 disabled:bg-[#134e4a]/70"
                      >
                        {loading ? 'Sending...' : 'Send Invitation'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Bulk Tab Content */}
                {activeTab === 'bulk' && (
                  <form onSubmit={handleBulkSubmit} className="space-y-4">
                    <div className="text-sm text-gray-600 mb-2">
                      Upload a CSV file containing user details. Ensure your file matches the required template.
                    </div>

                    <button
                      type="button"
                      onClick={downloadTemplate}
                      className="text-sm text-[#134e4a] hover:text-[#0f3e3b] font-medium flex items-center gap-1 mb-4"
                    >
                      <DocumentTextIcon className="w-4 h-4" /> Download CSV Template
                    </button>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Click to upload CSV"
                      />
                      <ArrowUpTrayIcon className="w-8 h-8 text-gray-400 mb-2" />
                      {file ? (
                        <div className="text-sm font-medium text-indigo-600 text-center">
                          Selected: {file.name}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 text-center">
                          <span className="font-semibold text-[#134e4a]">Click to upload</span> or drag and drop<br />
                          CSV up to 5MB
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading || !file}
                        className="inline-flex justify-center rounded-lg bg-[#134e4a] px-4 py-2 text-sm font-medium text-white hover:bg-[#0f3e3b] focus:outline-none focus:ring-2 focus:ring-[#134e4a] focus:ring-offset-2 disabled:bg-[#134e4a]/70"
                      >
                        {loading ? 'Processing...' : 'Upload & Invite'}
                      </button>
                    </div>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
