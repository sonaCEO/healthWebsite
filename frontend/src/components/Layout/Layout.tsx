import { Box } from '@chakra-ui/react'
import Header from './Header'
import { type ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Header />
      <Box flex="1" as="main">
        {children}
      </Box>
      
      {/* <Footer /> если решу добавить */}
    </Box>
  )
}

export default Layout