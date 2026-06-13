
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'
import AutocannonTester from './autocannon'

function App() {

  return (
    <>
      <ToastContainer closeOnClick pauseOnFocusLoss position="top-right" />
      <AutocannonTester />
    </>
  )
}

export default App
