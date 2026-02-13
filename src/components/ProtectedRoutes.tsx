import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import type { RootState } from "../app/store";


type ProtectedRouteProps ={
  children: ReactNode
}
const ProtectedRoutes = ({children}:ProtectedRouteProps) => {
  const {isAuthenticated} = useSelector((state:RootState)=>state.auth);
    if(!isAuthenticated){
      return <Navigate to='/login' replace/>
    }

    return <>{children}</>
 
}

export default ProtectedRoutes