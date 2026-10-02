import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {HeroUIProvider} from "./HeroUI/HeroUIProvider/HeroUIProvider.tsx";
import './HeroUI/HeroUIStyles/HeroUIStyles.css'
import './HeroUI/HeroUIStyles/HeroUIThemes.Module.css'
import App from './App.js'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <HeroUIProvider>
            <App/>
        </HeroUIProvider>
    </StrictMode>,
)
