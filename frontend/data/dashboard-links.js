import { ACCOUNT_TYPE } from '../src/utils/constants';

export const sidebarLinks = [
  {
    id: 1,
    name: "Analytics",
    path: "/dashboard/admin/analytics",
    type: ACCOUNT_TYPE.ADMIN,
    icon: "VscGraph",
  },
  {
    id: 2,
    name: "My Profile",
    path: "/dashboard/my-profile",
    icon: "VscAccount",
  },
  {
    id: 3,
    name: "Dashboard",
    path: "/dashboard/instructor",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscDashboard",
  },
  {
    id: 4,
    name: "My Courses",
    path: "/dashboard/my-courses",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscVm",
  },
  {
    id: 5,
    name: "Enrolled Courses",
    path: "/dashboard/enrolled-courses",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscMortarBoard",
  },
  {
    id: 8,
    name: "Analytics",
    path: "/dashboard/user-analytics",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscGraph",
  },
  {
    id: 6,
    name: "Purchase History",
    path: "/dashboard/purchase-history",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscHistory",
  },
  {
    id: 7,
    name: "Certificates",
    path: "/dashboard/certificates",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscMortarBoard",
  },
  {
    id: 9,
    name: "Chats",
    path: "/dashboard/instructor-chats",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscComment",
  },
];
