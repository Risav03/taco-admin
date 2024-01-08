'use client';

//Context
// import { GlobalContextProvider } from '../context/MainContext';

//Web3
import RainbowProvider from './rainbow/rainbowKit';

const Providers = ({ children }) => {

  return (
    <RainbowProvider>
      {children}
    </RainbowProvider>
  )
}

export default Providers