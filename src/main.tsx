import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {HeroUIProvider} from './HeroUI/HeroUIProvider/HeroUIProvider'
import './HeroUI/HeroUIStyles/HeroUIStyles.css'
import './HeroUI/HeroUIStyles/HeroUIThemes.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <HeroUIProvider>
            <App/>
        </HeroUIProvider>
    </StrictMode>,
)
