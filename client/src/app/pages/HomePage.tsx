import { Toaster } from "sonner"
import ShowCase from "../../components/ShowCase"
import UploadSection from "../../components/UploadSection"

 
 const HomePage = () =>{
   return (
    <div className="w-full md:flex justify-between h-screen">
            <Toaster position="bottom-right" expand={false} richColors />

      <UploadSection/>
      <ShowCase/>
    </div>
   )
 }
 
 export default HomePage