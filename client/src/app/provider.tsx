import React, { ReactNode } from 'react'


interface ProviderProps {
  children: ReactNode
}

const Provider: React.FC<ProviderProps> = ({ children }) => {
  return (
    <>
     
            {children}
    
    </>
  )
}

export default Provider