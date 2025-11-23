function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold mb-4 text-blue-600">AgiRity</h1>
        <p className="text-gray-700 mb-2">Start working in 3 seconds, not 3 minutes.</p>
        <p className="text-sm text-gray-500">Environment: {window.ipcRenderer ? 'Electron' : 'Web'}</p>
      </div>
    </div>
  );
}

export default App;
