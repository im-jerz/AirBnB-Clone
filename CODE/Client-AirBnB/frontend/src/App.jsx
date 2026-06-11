import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all hover:scale-105">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-4">
          React + Vite
        </h1>
        <p className="text-center text-gray-600 mb-6">
          with Tailwind CSS + Docker
        </p>
        <div className="text-center">
          <button
            onClick={() => setCount((count) => count + 1)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition duration-300 transform hover:scale-105 shadow-lg"
          >
            Count: {count}
          </button>
        </div>
        <p className="text-center text-gray-500 text-sm mt-6">
          Edit <code className="bg-gray-100 px-2 py-1 rounded">src/App.jsx</code> and save to test HMR
        </p>
      </div>
    </div>
  )
}

export default App