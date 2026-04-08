import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AcceptInvite from './components/AcceptInvite.jsx'


createRoot(document.getElementById('root')).render(

     <BrowserRouter>
     
        <Routes>
            {/* Public route for accept-invite */}
            <Route path="/accept-invite/:token" element={<AcceptInvite />} />
            
            {/* All other app routes */}
            <Route path="/*" element={<App />} />
        </Routes>
     </BrowserRouter>
    

)
