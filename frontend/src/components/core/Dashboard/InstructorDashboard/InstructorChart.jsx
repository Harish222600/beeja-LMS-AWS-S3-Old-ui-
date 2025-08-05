import { useState } from "react"
import { Chart, registerables } from "chart.js"
import { Pie } from "react-chartjs-2"

Chart.register(...registerables)

export default function InstructorChart({ courses }) {
  const [currChart, setCurrChart] = useState("students")

  // Generate modern gradient colors
  const generateModernColors = (numColors) => {
    const colors = [
      'rgba(139, 92, 246, 0.8)', // Purple
      'rgba(59, 130, 246, 0.8)',  // Blue
      'rgba(16, 185, 129, 0.8)',  // Green
      'rgba(245, 158, 11, 0.8)',  // Amber
      'rgba(239, 68, 68, 0.8)',   // Red
      'rgba(236, 72, 153, 0.8)',  // Pink
      'rgba(14, 165, 233, 0.8)',  // Sky
      'rgba(168, 85, 247, 0.8)',  // Violet
    ]
    return colors.slice(0, numColors)
  }

  const chartDataStudents = {
    labels: courses.map((course) => course.courseName),
    datasets: [
      {
        data: courses.map((course) => course.totalStudentsEnrolled),
        backgroundColor: generateModernColors(courses.length),
        borderColor: generateModernColors(courses.length).map(color => color.replace('0.8', '1')),
        borderWidth: 2,
      },
    ],
  }

  const chartIncomeData = {
    labels: courses.map((course) => course.courseName),
    datasets: [
      {
        data: courses.map((course) => course.totalAmountGenerated),
        backgroundColor: generateModernColors(courses.length),
        borderColor: generateModernColors(courses.length).map(color => color.replace('0.8', '1')),
        borderWidth: 2,
      },
    ],
  }

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif'
          },
          color: '#e2e8f0'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#e2e8f0',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(139, 92, 246, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${currChart === 'income' ? '₹' : ''}${value} (${percentage}%)`;
          }
        }
      }
    }
  }

  return (
    <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Performance Analytics</h3>
        
        <div className="flex gap-2">
          <button
            onClick={() => setCurrChart("students")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              currChart === "students"
                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            Students
          </button>
          
          <button
            onClick={() => setCurrChart("income")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              currChart === "income"
                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            Income
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="w-full max-w-[350px] h-[350px] relative">
          <Pie
            data={currChart === "students" ? chartDataStudents : chartIncomeData}
            options={options}
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-slate-800/50 rounded-lg">
          <p className="text-sm text-slate-400">Total {currChart === 'students' ? 'Students' : 'Revenue'}</p>
          <p className="text-lg font-semibold text-white">
            {currChart === 'students' 
              ? courses.reduce((acc, course) => acc + course.totalStudentsEnrolled, 0)
              : `₹${courses.reduce((acc, course) => acc + course.totalAmountGenerated, 0)}`
            }
          </p>
        </div>
        <div className="text-center p-3 bg-slate-800/50 rounded-lg">
          <p className="text-sm text-slate-400">Active Courses</p>
          <p className="text-lg font-semibold text-white">{courses.length}</p>
        </div>
      </div>
    </div>
  )
}
