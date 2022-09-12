import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import Uploader from './components/Uploader'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <Uploader></Uploader>
    </div>
  )
}

export default App
