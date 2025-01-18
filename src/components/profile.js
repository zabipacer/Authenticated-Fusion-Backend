import { useNavigate } from "react-router-dom"

import { signOut } from "firebase/auth"
import { auth } from "./firebase"
import Dashboard from "./Dashboard"






 const Profile = ()=>{
    const navigate = useNavigate()



    const handleLogout  = async()=>{
         try{
             await signOut(auth)
             alert('you have Logged out')
             navigate('/')
         }catch(error){
             alert('Error')
         }
    }



    if ( !auth.currentUser){
         navigate('/')
         return null
    }

      return(<>
        <h1>Wellcome {auth.currentUser.email}</h1>
<Dashboard/>
        <button onClick={handleLogout}>Logout</button>
      
      </>)
 }


 export default Profile