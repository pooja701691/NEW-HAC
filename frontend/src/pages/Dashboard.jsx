import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, BookOpen, Trophy, FileText } from 'lucide-react';

const Dashboard = () => {
  const cards = [
    {
      title: 'Attendance',
      icon: Calendar,
      description: 'Mark your attendance',
      link: '/attendance',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Quiz',
      icon: BookOpen,
      description: 'Take AI-powered quizzes',
      link: '/quiz',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Notes',
      icon: FileText,
      description: 'Access smart notes',
      link: '/notes',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Leaderboard',
      icon: Trophy,
      description: 'Check your ranking',
      link: '/leaderboard',
      color: 'from-yellow-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 p-4">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-4xl font-bold text-white text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Welcome to CampusIQ Dashboard
        </motion.h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              className={`bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center mb-4`}>
                <card.icon size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{card.title}</h3>
              <p className="text-white/70 mb-4">{card.description}</p>
              <a
                href={card.link}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Go to {card.title} →
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;