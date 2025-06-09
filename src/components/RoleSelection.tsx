import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBriefcase,
  FaUsers
} from 'react-icons/fa';
import { ReactNode } from 'react';

interface Role {
  name: string;
  icon: ReactNode;
  color: string;
}

export default function RoleSelection() {
  const navigate = useNavigate();

  const handleSelect = (role: string) => {
    console.log('Selected Role:', role);
    navigate('/dashboard', { state: { role } });
  };

  const roles: Role[] = [
    { name: 'Student', icon: <FaUserGraduate />, color: 'from-green-400 to-emerald-600' },
    { name: 'Teacher', icon: <FaChalkboardTeacher />, color: 'from-pink-500 to-rose-600' },
    { name: 'Professional', icon: <FaBriefcase />, color: 'from-blue-500 to-indigo-700' },
    { name: 'Friends/Colleagues', icon: <FaUsers />, color: 'from-yellow-400 to-orange-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white flex items-center justify-center px-6">
      <motion.div
        className="w-full max-w-5xl text-center space-y-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-bold text-white">
          Who are you hosting for?
        </h1>
        <p className="text-lg text-gray-300">Select your role to personalize your experience:</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role, i) => (
            <motion.button
              key={role.name}
              onClick={() => handleSelect(role.name)}
              whileHover={{ scale: 1.08 }}
              className={`bg-gradient-to-br ${role.color} p-6 rounded-2xl shadow-lg text-white flex flex-col items-center justify-center gap-4 transition-transform hover:shadow-2xl`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-4xl">{role.icon}</div>
              <div className="text-xl font-semibold">{role.name}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
