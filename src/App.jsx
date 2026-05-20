import { useState } from 'react'
import ReceiptGenerator from './page/ReciptGenerator'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <ReceiptGenerator />
    </>
  )
}

export default App
