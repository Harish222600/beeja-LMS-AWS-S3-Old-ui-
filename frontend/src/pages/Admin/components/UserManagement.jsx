import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { getAllUsers, createUser, updateUser, deleteUser, toggleUserStatus } from "../../../services/operations/adminAPI";
import { moveToRecycleBin } from "../../../services/operations/recycleBinAPI";
import { FaEdit, FaTrash, FaEye, FaEyeSlash, FaUser, FaPlus, FaSearch, FaCopy, FaFileCsv, FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { toast } from "react-hot-toast";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const UserManagement = () => {
  const { token } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [togglingUserId, setTogglingUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, inactive
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    accountType: "Student",
    contactNumber: ""
  });

  // Helper function to generate profile picture
  const getProfilePicture = (user) => {
    if (user.image) {
      return user.image;
    }
    return null;
  };

  // Helper function to get initials
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Helper function to get account type color
  const getAccountTypeColor = (accountType) => {
    switch (accountType) {
      case 'Admin':
        return 'bg-red-500 text-white';
      case 'Instructor':
        return 'bg-blue-500 text-white';
      case 'Student':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Filter users based on search term and status filter
  const filteredUsers = users.filter(user => {
    // First apply search filter
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.accountType.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Then apply status filter
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && user.active) ||
      (statusFilter === "inactive" && !user.active);
    
    return matchesSearch && matchesStatus;
  });

  const loadUsers = useCallback(async (mounted = true) => {
    try {
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      setLoading(true);
      console.log("Loading users with token:", token);
      
      const response = await getAllUsers(token);
      console.log("Users response:", response);
      
      if (mounted) {
        setUsers(response || []);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching users:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      if (mounted) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch users';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  }, [token]);

  useEffect(() => {
    let mounted = true;
    
    // Import and use debug utilities
    import('../../../utils/apiDebugger').then(({ debugAPIIssues, testAdminAPI }) => {
      debugAPIIssues();
      if (token) {
        testAdminAPI(token).catch(console.error);
      }
    });

    if (!token) {
      console.error("No token available in Redux state");
      setError("Authentication required");
      return;
    }

    // Log token details
    console.log('Token details:', {
      exists: !!token,
      length: token?.length,
      preview: token ? `${token.substring(0, 20)}...` : 'none',
      fromLocalStorage: !!localStorage.getItem('token')
    });

    loadUsers(mounted);
    return () => {
      mounted = false;
    };
  }, [loadUsers, token]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const result = await createUser(formData, token);
      setShowCreateModal(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        accountType: "Student",
        contactNumber: ""
      });
      await loadUsers(true); // Refresh user list
      
    } catch (error) {
      setError(error.message);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const result = await updateUser(selectedUser._id, formData, token);
      setShowEditModal(false);
      setSelectedUser(null);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        accountType: "Student",
        contactNumber: ""
      });
      await loadUsers(true); // Refresh user list
      toast.success("User updated successfully");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!token) {
      toast.error("Authentication token is missing");
      return;
    }

    try {
      setDeletingUserId(userId);
      setError(null);

      // Log deletion attempt
      console.log('Attempting to move user to recycle bin:', {
        userId,
        tokenExists: !!token
      });
      
      const result = await moveToRecycleBin(token, 'User', userId, 'User moved to recycle bin by admin');
      
      if (result) {
        setConfirmationModal(null);
        await loadUsers(true);
      }
      
    } catch (error) {
      console.error('Move to recycle bin operation failed:', {
        error: error.message,
        userId,
        response: error.response?.data
      });
      
      // Show specific error message
      const errorMessage = error.response?.data?.message || error.message || 'Failed to move user to recycle bin';
      setError(errorMessage);
      setConfirmationModal(null);
      
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleToggleUserStatus = async (userId) => {
    if (!token) {
      toast.error("Authentication token is missing");
      return;
    }
    try {
      setTogglingUserId(userId);
      await toggleUserStatus(userId, token);
      await loadUsers(true);
    } catch (error) {
      console.error('Toggle user status failed:', error);
      toast.error(error.response?.data?.message || 'Failed to update user status');
    } finally {
      setTogglingUserId(null);
    }
  };

  // Helper function to format user data for export
  const formatUserData = (user, index) => ({
    'S.No': index + 1,
    'User ID': user._id,
    'User Name': `${user.firstName} ${user.lastName}`,
    'Email': user.email,
    'Role': user.accountType,
    'Contact': user.additionalDetails?.contactNumber || 'N/A',
    'Status': user.active ? 'Active' : 'Inactive'
  });

  // Copy to clipboard with improved formatting
  const handleCopy = () => {
    const headers = columnConfig.map(col => col.field);
    const data = filteredUsers.map((user, index) => formatUserData(user, index));
    
    // Function to pad text for better alignment
    const padText = (text, width) => {
      const str = String(text || '');
      if (str.length >= width) return str;
      return str + ' '.repeat(width - str.length);
    };

    // Format data rows with proper spacing
    const formattedRows = data.map(row => {
      return columnConfig.map(col => {
        const value = String(row[col.field] || '');
        return padText(value, col.minWidth);
      }).join('\t');
    });
    
    // Format header row with same spacing
    const headerRow = columnConfig.map(col => {
      return padText(col.field, col.minWidth);
    }).join('\t');
    
    const finalString = [headerRow, ...formattedRows].join('\n');
    
    navigator.clipboard.writeText(finalString);
    toast.success('User data copied to clipboard');
  };

  // Column width configuration for exports - optimized for landscape A4
  const columnConfig = [
    { width: 12, field: 'S.No', minWidth: 18 },
    { width: 45, field: 'User ID', minWidth: 50 },
    { width: 50, field: 'User Name', minWidth: 55 },
    { width: 65, field: 'Email', minWidth: 70 },
    { width: 25, field: 'Role', minWidth: 30 },
    { width: 35, field: 'Contact', minWidth: 40 },
    { width: 25, field: 'Status', minWidth: 30 }
  ];

  // Export as CSV with proper formatting for landscape A4
  const handleCSV = () => {
    const data = filteredUsers.map((user, index) => formatUserData(user, index));
    
    // Function to escape CSV values and ensure proper formatting
    const escapeCSV = (value) => {
      const str = String(value || '');
      // If value contains comma, quote, or newline, wrap in quotes and escape quotes
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Create CSV rows with proper comma separation
    const csvRows = data.map(row => {
      return [
        escapeCSV(row['S.No']),
        escapeCSV(row['User ID']),
        escapeCSV(row['User Name']),
        escapeCSV(row['Email']),
        escapeCSV(row['Role']),
        escapeCSV(row['Contact']),
        escapeCSV(row['Status'])
      ].join(',');
    });
    
    // Create header row
    const headerRow = [
      'S.No',
      'User ID',
      'User Name',
      'Email',
      'Role',
      'Contact',
      'Status'
    ].join(',');
    
    // Create CSV content with UTF-8 BOM for Excel compatibility
    const BOM = '\uFEFF';
    const csvContent = BOM + [headerRow, ...csvRows].join('\n');
    
    // Save as standard CSV
    const blob = new Blob([csvContent], { 
      type: 'text/csv;charset=utf-8;'
    });
    saveAs(blob, 'users.csv');
  };

  // Export as Excel
  const handleExcel = () => {
    const data = filteredUsers.map((user, index) => formatUserData(user, index));
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Convert columnConfig to Excel column widths
    ws['!cols'] = columnConfig.map(col => ({ wch: col.width }));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, 'users.xlsx');
  };


  // Common PDF configuration
  const getPDFConfig = (doc) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const totalWidth = pageWidth - 20; // Account for margins
    const totalConfigWidth = columnConfig.reduce((sum, col) => sum + col.minWidth, 0);
    
    const headers = [columnConfig.map(col => col.field)];
    const data = filteredUsers.map((user, index) => {
      const formattedUser = formatUserData(user, index);
      return columnConfig.map(col => formattedUser[col.field]);
    });

    return {
      head: headers,
      body: data,
      theme: 'grid',
      startY: 15,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'left',
        valign: 'middle',
        lineWidth: 0.5
      },
      headStyles: {
        fillColor: [33, 37, 41],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        cellPadding: 4
      },
      margin: { left: 10, right: 10, top: 15 },
      tableWidth: totalWidth,
      columnStyles: Object.fromEntries(
        columnConfig.map((col, index) => [
          index,
          { 
            cellWidth: (totalWidth * col.minWidth) / totalConfigWidth,
            fontSize: index === 0 ? 7 : 8 // Smaller font for S.No column
          }
        ])
      ),
      didDrawPage: (data) => {
        doc.setFontSize(12);
        doc.text('User Management Report', pageWidth / 2, 10, { align: 'center' });
      },
      willDrawCell: (data) => {
        // Add extra padding for cells with long content
        if (data.cell.text.join('').length > 30) {
          data.cell.styles.cellPadding = 2;
        }
      }
    };
  };

  // Export as PDF
  const handlePDF = () => {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    autoTable(doc, getPDFConfig(doc));
    doc.save('users.pdf');
  };

  // Print
  const handlePrint = () => {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    autoTable(doc, getPDFConfig(doc));
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      accountType: user.accountType,
      contactNumber: user.additionalDetails?.contactNumber || ""
    });
    setShowEditModal(true);
  };

  return (
    <div className="text-richblack-5 h-full flex flex-col overflow-hidden">
      <div className="space-y-6 mb-6 flex-shrink-0">
        {/* Header and Stats */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-2xl font-semibold">User Management</h4>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-yellow-50 text-richblack-900 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-yellow-100 transition-all duration-200"
            >
              <FaPlus size={16} />
              Add New User
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-richblack-700 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-richblack-300">Total Users</p>
                <p className="text-2xl font-bold text-richblack-5">{users.length}</p>
                <p className="text-xs text-richblack-400">
                  {users.filter(u => u.active).length} active, {users.filter(u => !u.active).length} inactive
                </p>
              </div>
              <FaUser className="text-yellow-50 text-2xl" />
            </div>
            <div className="bg-richblack-700 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-richblack-300">Students</p>
                <p className="text-2xl font-bold text-richblack-5">
                  {users.filter(u => u.accountType === 'Student').length}
                </p>
                <p className="text-xs text-richblack-400">
                  {users.filter(u => u.accountType === 'Student' && u.active).length} active
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <FaUser className="text-white text-xl" />
              </div>
            </div>
            <div className="bg-richblack-700 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-richblack-300">Instructors</p>
                <p className="text-2xl font-bold text-richblack-5">
                  {users.filter(u => u.accountType === 'Instructor').length}
                </p>
                <p className="text-xs text-richblack-400">
                  {users.filter(u => u.accountType === 'Instructor' && u.active).length} active
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <FaUser className="text-white text-xl" />
              </div>
            </div>
            <div className="bg-richblack-700 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-richblack-300">Admins</p>
                <p className="text-2xl font-bold text-richblack-5">
                  {users.filter(u => u.accountType === 'Admin').length}
                </p>
                <p className="text-xs text-richblack-400">
                  {users.filter(u => u.accountType === 'Admin' && u.active).length} active
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                <FaUser className="text-white text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Export Options and Search */}
        <div className="space-y-4">
          {/* Export Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-richblack-700 hover:bg-richblack-600 text-richblack-50 rounded-lg transition-all duration-200"
              title="Copy to Clipboard"
            >
              <FaCopy /> Copy
            </button>
            <button
              onClick={handleCSV}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-richblack-700 hover:bg-richblack-600 text-richblack-50 rounded-lg transition-all duration-200"
              title="Export as CSV"
            >
              <FaFileCsv /> CSV
            </button>
            <button
              onClick={handleExcel}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-richblack-700 hover:bg-richblack-600 text-richblack-50 rounded-lg transition-all duration-200"
              title="Export as Excel"
            >
              <FaFileExcel /> Excel
            </button>
            <button
              onClick={handlePDF}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-richblack-700 hover:bg-richblack-600 text-richblack-50 rounded-lg transition-all duration-200"
              title="Export as PDF"
            >
              <FaFilePdf /> PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-richblack-700 hover:bg-richblack-600 text-richblack-50 rounded-lg transition-all duration-200"
              title="Print"
            >
              <FaPrint /> Print
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-richblack-700 rounded-lg pl-10 pr-4 py-2 text-richblack-5"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400" />
            </div>
            
            {/* Status Filter */}
            <div className="flex-shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-richblack-700 rounded-lg px-4 py-2 text-richblack-5 border border-richblack-600 focus:border-yellow-50 focus:outline-none"
              >
                <option value="all">All Users</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-richblack-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-richblack-800 p-4 sm:p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Create New User</h3>
            <form onSubmit={handleCreateUser}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full bg-richblack-700 rounded-lg p-3"
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full bg-richblack-700 rounded-lg p-3"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-richblack-700 rounded-lg p-3"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-richblack-700 rounded-lg p-3"
                  required
                />
                <select
                  value={formData.accountType}
                  onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                  className="w-full bg-richblack-700 rounded-lg p-3"
                  required
                >
                  <option value="Student">Student</option>
                  <option value="Instructor">Instructor</option>
                  <option value="Admin">Admin</option>
                </select>
                <input
                  type="tel"
                  placeholder="Contact Number"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                  className="w-full bg-richblack-700 rounded-lg p-3"
                />
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-richblack-700 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-yellow-50 text-richblack-900 px-4 py-2 rounded-lg"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-richblack-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-richblack-800 p-4 sm:p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Edit User</h3>
            <form onSubmit={handleUpdateUser}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full bg-richblack-700 rounded-lg p-3"
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full bg-richblack-700 rounded-lg p-3"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-richblack-700 rounded-lg p-3"
                  required
                />
                <select
                  value={formData.accountType}
                  onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                  className="w-full bg-richblack-700 rounded-lg p-3"
                  required
                >
                  <option value="Student">Student</option>
                  <option value="Instructor">Instructor</option>
                  <option value="Admin">Admin</option>
                </select>
                <input
                  type="tel"
                  placeholder="Contact Number"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                  className="w-full bg-richblack-700 rounded-lg p-3"
                />
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-richblack-700 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-yellow-50 text-richblack-900 px-4 py-2 rounded-lg"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="w-8 h-8 animate-spin rounded-full border-b-2 border-yellow-50"/>
          <span className="ml-2">Loading users...</span>
        </div>
      )}
      {error && (
        <div className="bg-red-900 border border-red-500 text-red-100 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      {!loading && !error && (
        <div className="flex-1 bg-richblack-800 rounded-xl overflow-hidden shadow-xl min-h-0">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-richblack-700 border-b border-richblack-600">
                  <th className="p-4 text-richblack-5 font-semibold">User</th>
                  <th className="p-4 text-richblack-5 font-semibold">Email</th>
                  <th className="p-4 text-richblack-5 font-semibold">Role</th>
                  <th className="p-4 text-richblack-5 font-semibold">Contact</th>
                  <th className="p-4 text-richblack-5 font-semibold">Status</th>
                  <th className="p-4 text-richblack-5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-richblack-300">
                      {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="border-b border-richblack-600 hover:bg-richblack-700 transition-colors duration-200">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {/* Profile Picture */}
                          <div className="relative">
                            {getProfilePicture(user) ? (
                              <img
                                src={getProfilePicture(user)}
                                alt={`${user.firstName} ${user.lastName}`}
                                className="w-10 h-10 rounded-full object-cover border-2 border-richblack-600"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-richblack-600">
                                {getInitials(user.firstName, user.lastName)}
                              </div>
                            )}
                          </div>
                          {/* Name */}
                          <div>
                            <div className="font-medium text-richblack-5">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-richblack-300">
                              ID: {user._id.slice(-6)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-richblack-100">{user.email}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(user.accountType)}`}>
                          {user.accountType}
                        </span>
                      </td>
                      <td className="p-4 text-richblack-100">{user.additionalDetails?.contactNumber || 'N/A'}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                        }`}>
                          {user.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleUserStatus(user._id)}
                            className={`p-3 rounded-lg transition-colors duration-200 ${
                              user.active 
                                ? 'text-green-500 hover:bg-green-500 hover:bg-opacity-20' 
                                : 'text-gray-500 hover:bg-gray-500 hover:bg-opacity-20'
                            }`}
                            disabled={togglingUserId === user._id}
                            title={user.active ? 'Deactivate User' : 'Activate User'}
                          >
                            {togglingUserId === user._id ? (
                              <div className="w-4 h-4 animate-spin rounded-full border-b-2 border-green-500"/>
                            ) : (
                              user.active ? <FaEye size={16} /> : <FaEyeSlash size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => handleEditClick(user)}
                            className="text-yellow-50 hover:text-yellow-100"
                            title="Edit User"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setConfirmationModal({
                                text1: "Move User to Recycle Bin?",
                                text2: `Are you sure you want to move "${user.firstName} ${user.lastName}" to recycle bin? The user will be automatically deleted after 30 days, but you can restore them anytime before that.`,
                                btn1Text: "Move to Recycle Bin",
                                btn2Text: "Cancel",
                                btn1Handler: () => handleDeleteUser(user._id),
                                btn2Handler: () => setConfirmationModal(null),
                              })
                            }}
                            disabled={deletingUserId === user._id}
                            className={`text-red-500 hover:text-red-600 ${
                              deletingUserId === user._id ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            title="Move to Recycle Bin"
                          >
                            {deletingUserId === user._id ? (
                              <div className="w-4 h-4 animate-spin rounded-full border-b-2 border-red-500"/>
                            ) : (
                              <FaTrash size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4 p-4 max-h-full overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="text-center p-6 bg-richblack-700 rounded-lg">
                <p>{searchTerm ? 'No users found matching your search.' : 'No users found.'}</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user._id} className="bg-richblack-700 rounded-lg p-3 space-y-3 overflow-hidden">
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      {getProfilePicture(user) ? (
                        <img
                          src={getProfilePicture(user)}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-10 h-10 rounded-full object-cover border-2 border-richblack-600"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-richblack-600">
                          {getInitials(user.firstName, user.lastName)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-white text-sm truncate">{user.firstName} {user.lastName}</h5>
                          <p className="text-xs text-richblack-300 truncate">{user.email}</p>
                          <p className="text-xs text-richblack-400">ID: {user._id.slice(-6)}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getAccountTypeColor(user.accountType)}`}>
                            {user.accountType}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-richblack-300 space-y-1">
                    <p><span className="font-medium">Contact:</span> {user.additionalDetails?.contactNumber || 'N/A'}</p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Status:</span> 
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                      }`}>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                  
                  <div className="flex justify-center gap-4 pt-2 border-t border-richblack-600">
                    <button
                      onClick={() => handleToggleUserStatus(user._id)}
                      className={`p-2 rounded-full ${user.active ? 'text-green-500 bg-green-500/10' : 'text-gray-500 bg-gray-500/10'} hover:bg-opacity-20 transition-colors`}
                      disabled={togglingUserId === user._id}
                      title={user.active ? 'Deactivate User' : 'Activate User'}
                    >
                      {togglingUserId === user._id ? (
                        <div className="w-4 h-4 animate-spin rounded-full border-b-2 border-green-500"/>
                      ) : (
                        user.active ? <FaEye size={14} /> : <FaEyeSlash size={14} />
                      )}
                    </button>
                    <button
                      onClick={() => handleEditClick(user)}
                      className="p-2 rounded-full text-yellow-50 bg-yellow-50/10 hover:bg-yellow-50/20 transition-colors"
                      title="Edit User"
                    >
                      <FaEdit size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setConfirmationModal({
                          text1: "Move User to Recycle Bin?",
                          text2: `Are you sure you want to move "${user.firstName} ${user.lastName}" to recycle bin? The user will be automatically deleted after 30 days, but you can restore them anytime before that.`,
                          btn1Text: "Move to Recycle Bin",
                          btn2Text: "Cancel",
                          btn1Handler: () => handleDeleteUser(user._id),
                          btn2Handler: () => setConfirmationModal(null),
                        })
                      }}
                      disabled={deletingUserId === user._id}
                      className={`p-2 rounded-full text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors ${
                        deletingUserId === user._id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="Move to Recycle Bin"
                    >
                      {deletingUserId === user._id ? (
                        <div className="w-4 h-4 animate-spin rounded-full border-b-2 border-red-500"/>
                      ) : (
                        <FaTrash size={14} />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmationModal && (
        <ConfirmationModal
          modalData={confirmationModal}
          closeModal={() => setConfirmationModal(null)}
        />
      )}
    </div>
  );
};

export default UserManagement;
