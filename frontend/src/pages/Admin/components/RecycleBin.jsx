import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaTrash, FaUndo, FaUsers, FaBookOpen, FaTag, FaCalendarAlt, FaUser, FaSearch, FaFilter, FaTrashAlt } from 'react-icons/fa';
import { MdDeleteForever, MdRestore } from 'react-icons/md';
import { BiTime } from 'react-icons/bi';
import { 
    getRecycleBinItems, 
    getRecycleBinStats, 
    restoreFromRecycleBin, 
    permanentlyDeleteItem,
    cleanupExpiredItems 
} from '../../../services/operations/recycleBinAPI';
import { formatDate, getRelativeTime } from '../../../utils/dateFormatter';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

const RecycleBin = () => {
    const { token } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState('all');
    const [items, setItems] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [confirmationModal, setConfirmationModal] = useState(null);

    const itemsPerPage = 10;

    const tabs = [
        { id: 'all', label: 'All Items', icon: <FaTrash className="w-4 h-4" />, type: null },
        { id: 'users', label: 'Users', icon: <FaUsers className="w-4 h-4" />, type: 'User' },
        { id: 'courses', label: 'Courses', icon: <FaBookOpen className="w-4 h-4" />, type: 'Course' },
        { id: 'categories', label: 'Categories', icon: <FaTag className="w-4 h-4" />, type: 'Category' }
    ];

    useEffect(() => {
        fetchRecycleBinItems();
        fetchStats();
    }, [activeTab, currentPage]);

    const fetchRecycleBinItems = async () => {
        setLoading(true);
        try {
            const currentTab = tabs.find(tab => tab.id === activeTab);
            const result = await getRecycleBinItems(token, currentTab?.type, currentPage, itemsPerPage);
            if (result?.success) {
                setItems(result.data || []);
                setPagination(result.pagination);
            }
        } catch (error) {
            console.error('Error fetching recycle bin items:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const result = await getRecycleBinStats(token);
            if (result) {
                setStats(result);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleRestore = async (recycleBinId, itemType) => {
        setConfirmationModal({
            text1: "Restore Item",
            text2: `Are you sure you want to restore this ${itemType.toLowerCase()}? It will be moved back to its original location.`,
            btn1Text: "Restore",
            btn2Text: "Cancel",
            btn1Handler: async () => {
                const success = await restoreFromRecycleBin(token, recycleBinId);
                if (success) {
                    fetchRecycleBinItems();
                    fetchStats();
                }
                setConfirmationModal(null);
            },
            btn2Handler: () => setConfirmationModal(null),
        });
    };

    const handlePermanentDelete = async (recycleBinId, itemType) => {
        setConfirmationModal({
            text1: "Permanent Delete",
            text2: `Are you sure you want to permanently delete this ${itemType.toLowerCase()}? This action cannot be undone.`,
            btn1Text: "Delete Forever",
            btn2Text: "Cancel",
            btn1Handler: async () => {
                const success = await permanentlyDeleteItem(token, recycleBinId);
                if (success) {
                    fetchRecycleBinItems();
                    fetchStats();
                }
                setConfirmationModal(null);
            },
            btn2Handler: () => setConfirmationModal(null),
        });
    };

    const handleCleanupExpired = async () => {
        setConfirmationModal({
            text1: "Cleanup Expired Items",
            text2: "Are you sure you want to permanently delete all expired items? This action cannot be undone.",
            btn1Text: "Cleanup",
            btn2Text: "Cancel",
            btn1Handler: async () => {
                const success = await cleanupExpiredItems(token);
                if (success) {
                    fetchRecycleBinItems();
                    fetchStats();
                }
                setConfirmationModal(null);
            },
            btn2Handler: () => setConfirmationModal(null),
        });
    };

    const filteredItems = items.filter(item => {
        if (!searchQuery) return true;
        const searchLower = searchQuery.toLowerCase();
        const itemName = getItemName(item);
        return itemName.toLowerCase().includes(searchLower);
    });

    const getItemName = (item) => {
        const data = item.originalData;
        switch (item.itemType) {
            case 'User':
                return `${data.firstName} ${data.lastName}`;
            case 'Course':
                return data.courseName || 'Unnamed Course';
            case 'Category':
                return data.name || 'Unnamed Category';
            default:
                return 'Unknown Item';
        }
    };

    const getItemIcon = (itemType) => {
        switch (itemType) {
            case 'User':
                return <FaUsers className="w-5 h-5 text-blue-400" />;
            case 'Course':
                return <FaBookOpen className="w-5 h-5 text-green-400" />;
            case 'Category':
                return <FaTag className="w-5 h-5 text-purple-400" />;
            default:
                return <FaTrash className="w-5 h-5 text-gray-400" />;
        }
    };

    const getExpiryStatus = (expiresAt) => {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        
        if (daysLeft <= 0) {
            return { status: 'expired', text: 'Expired', color: 'text-red-400' };
        } else if (daysLeft <= 7) {
            return { status: 'warning', text: `${daysLeft} days left`, color: 'text-yellow-400' };
        } else {
            return { status: 'safe', text: `${daysLeft} days left`, color: 'text-green-400' };
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-richblack-5">Recycle Bin</h2>
                    <p className="text-richblack-300 mt-1">
                        Manage deleted items. Items are automatically deleted after 30 days.
                    </p>
                </div>
                <button
                    onClick={handleCleanupExpired}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                >
                    <FaTrashAlt className="w-4 h-4" />
                    Cleanup Expired
                </button>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-richblack-800 border border-richblack-700 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <FaTrash className="w-8 h-8 text-red-600" />
                            <div>
                                <p className="text-richblack-300 text-sm">Total Items</p>
                                <p className="text-2xl font-bold text-richblack-5">{stats.totalItems}</p>
                            </div>
                        </div>
                    </div>
                    {stats.itemsByType?.map((item) => (
                        <div key={item._id} className="bg-richblack-800 border border-richblack-700 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                {getItemIcon(item._id)}
                                <div>
                                    <p className="text-richblack-300 text-sm">{item._id}s</p>
                                    <p className="text-2xl font-bold text-richblack-5">{item.count}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                            setCurrentPage(1);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                            activeTab === tab.id
                                ? 'bg-yellow-50 text-richblack-900'
                                : 'bg-richblack-800 text-richblack-300 hover:bg-richblack-700'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-richblack-800 border border-richblack-700 rounded-lg text-richblack-5 placeholder-richblack-400 focus:outline-none focus:border-yellow-50"
                />
            </div>

            {/* Items List */}
            <div className="bg-richblack-800 border border-richblack-700 rounded-lg overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-2 border-yellow-50 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-12">
                        <FaTrash className="w-16 h-16 text-richblack-600 mx-auto mb-4" />
                        <p className="text-richblack-300 text-lg">No items in recycle bin</p>
                        <p className="text-richblack-400 text-sm mt-1">
                            Deleted items will appear here
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-richblack-700">
                        {filteredItems.map((item) => {
                            const expiryStatus = getExpiryStatus(item.expiresAt);
                            return (
                                <div key={item._id} className="p-4 hover:bg-richblack-750 transition-colors duration-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            {getItemIcon(item.itemType)}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-richblack-5 font-medium truncate">
                                                    {getItemName(item)}
                                                </h3>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-richblack-400">
                                                    <span className="flex items-center gap-1">
                                                        <FaUser className="w-3 h-3" />
                                                        Deleted by {item.deletedBy?.firstName} {item.deletedBy?.lastName}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <FaCalendarAlt className="w-3 h-3" />
                                                        {formatDate(item.deletedAt)}
                                                    </span>
                                                    <span className={`flex items-center gap-1 ${expiryStatus.color}`}>
                                                        <BiTime className="w-3 h-3" />
                                                        {expiryStatus.text}
                                                    </span>
                                                </div>
                                                {item.reason && (
                                                    <p className="text-richblack-300 text-sm mt-1">
                                                        Reason: {item.reason}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleRestore(item._id, item.itemType)}
                                                className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors duration-200"
                                                title="Restore"
                                            >
                                                <MdRestore className="w-4 h-4" />
                                                Restore
                                            </button>
                                            <button
                                                onClick={() => handlePermanentDelete(item._id, item.itemType)}
                                                className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors duration-200"
                                                title="Delete Forever"
                                            >
                                                <MdDeleteForever className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-richblack-400 text-sm">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination.totalItems)} of {pagination.totalItems} items
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={!pagination.hasPrev}
                            className="px-3 py-1 bg-richblack-800 border border-richblack-700 rounded text-richblack-300 hover:bg-richblack-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            Previous
                        </button>
                        <span className="text-richblack-300 text-sm">
                            Page {currentPage} of {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                            disabled={!pagination.hasNext}
                            className="px-3 py-1 bg-richblack-800 border border-richblack-700 rounded text-richblack-300 hover:bg-richblack-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            Next
                        </button>
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

export default RecycleBin;
