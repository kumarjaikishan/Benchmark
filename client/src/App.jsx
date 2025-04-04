
import { ToastContainer } from 'react-toastify';
import './App.css'
import AutocannonTester from './autocannon'

function App() {

  return (
    <>
      <ToastContainer closeOnClick={true} pauseOnFocusLoss={true} />
      <AutocannonTester />
    </>
  )
}

export default App
