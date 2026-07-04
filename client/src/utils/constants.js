import {
  HiOutlineViewGrid,
  HiOutlineShoppingCart,
  HiOutlineCube,
  HiOutlineTag,
  HiOutlineArchive,
  HiOutlineClipboardList,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineLogout,
} from 'react-icons/hi';

export const SIDEBAR_MENU = [
  { name: 'Dashboard', path: '/dashboard', icon: HiOutlineViewGrid },
  { name: 'POS', path: '/pos', icon: HiOutlineShoppingCart },
  { name: 'Products', path: '/products', icon: HiOutlineCube },
  { name: 'Categories', path: '/categories', icon: HiOutlineTag },
  { name: 'Inventory', path: '/inventory', icon: HiOutlineArchive },
  { name: 'Orders', path: '/orders', icon: HiOutlineClipboardList },
  { name: 'Reports', path: '/reports', icon: HiOutlineChartBar },
  { name: 'Settings', path: '/settings', icon: HiOutlineCog },
];

export const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CARD', label: 'Card' },
];

export const ORDER_STATUSES = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

export const PAYMENT_STATUS = {
  PAID: { label: 'Paid', color: 'bg-green-100 text-green-800' },
  UNPAID: { label: 'Unpaid', color: 'bg-red-100 text-red-800' },
};

export const PRODUCT_STATUS = {
  ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-800' },
  INACTIVE: { label: 'Inactive', color: 'bg-gray-100 text-gray-600' },
};

export const INVENTORY_ACTIONS = [
  { value: 'ADD', label: 'Add Stock' },
  { value: 'REMOVE', label: 'Remove Stock' },
  { value: 'ADJUST', label: 'Adjust Stock' },
];

export const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=300&fit=crop&q=80';
