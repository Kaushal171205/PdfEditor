import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Navbar from './components/Navbar.jsx'
import Home from './pages/Home'
import Editor from './pages/Editor'
import Convert from './pages/Convert'
import About from './pages/About'
import NotFound from './pages/NotFound'
import CodeEditor from './pages/CodeEditor'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/code-editor" element={<CodeEditor />} />
        <Route path="/convert" element={<Convert />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
