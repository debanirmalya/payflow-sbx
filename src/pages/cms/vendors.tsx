import { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle2, ArrowLeft } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import VendorForm, { VendorFormValues } from './add/vendor';
import { showSuccessToast, showErrorToast } from '../../lib/toast';

interface Vendor {
  id: string;
  name: string;
  account_number: string;
  ifsc_code: string;
  added_by: string;
  status: 'approved' | 'pending';
  created_at: string;
  updated_at: string;
  added_by_user?: {
    name: string;
  };
}

const VendorsPage = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchVendors = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('vendors')
        .select(`
          *,
          added_by_user:users(name)
        `)
        .order('status', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Ensure all vendors have a status, defaulting to 'pending' if not set
      const vendorsWithStatus = data.map(vendor => ({
        ...vendor,
        status: vendor.status || 'pending'
      }));

      setVendors(vendorsWithStatus);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      showErrorToast('Failed to load vendors');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
    // Get current user ID
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) throw error;

      // Update the local state to reflect the change
      setVendors(vendors.map(vendor => 
        vendor.id === id 
          ? { ...vendor, status: 'approved' }
          : vendor
      ));
      showSuccessToast('Vendor approved successfully');
    } catch (err) {
      console.error('Error approving vendor:', err);
      showErrorToast('Failed to approve vendor');
    }
  };

  const handleAddVendor = async (values: VendorFormValues) => {
    if (!currentUserId) {
      showErrorToast('User not authenticated');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('vendors')
        .insert([
          {
            name: values.name,
            account_number: values.account_number,
            ifsc_code: values.ifsc_code,
            status: 'approved',
            added_by: currentUserId
          }
        ]);

      if (error) throw error;

      setShowAddForm(false);
      fetchVendors();
      showSuccessToast('Vendor added successfully');
    } catch (err) {
      console.error('Error adding vendor:', err);
      showErrorToast('Failed to add vendor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.account_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.ifsc_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your vendors
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vendor
          </Button>
        </div>

        {showAddForm && (
          <Card className="mb-6">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Add New Vendor</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowAddForm(false)}
                  className="inline-flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Vendors
                </Button>
              </div>
            </div>
            <VendorForm
              onSubmit={handleAddVendor}
              onCancel={() => setShowAddForm(false)}
              isSubmitting={isSubmitting}
            />
          </Card>
        )}

        {!showAddForm && (
          <>
            <Card className="mb-6">
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search vendors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </Card>

            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IFSC Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Added By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                          Loading...
                        </td>
                      </tr>
                    ) : filteredVendors.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                          No vendors found
                        </td>
                      </tr>
                    ) : (
                      filteredVendors.map((vendor) => (
                        <tr key={vendor.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {vendor.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {vendor.account_number}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {vendor.ifsc_code}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${
                              vendor.status === 'approved' 
                                ? 'text-green-600' 
                                : 'text-yellow-600'
                            }`}>
                              {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {vendor.added_by_user?.name || 'Unknown'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(vendor.created_at).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {vendor.status === 'pending' && (
                              <Button
                                onClick={() => handleApprove(vendor.id)}
                                className="inline-flex items-center text-green-600 hover:text-green-900"
                                variant="ghost"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default VendorsPage; 