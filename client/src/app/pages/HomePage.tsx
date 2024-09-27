import ShowCase from "../../components/ShowCase"
import UploadSection from "../../components/UploadSection"

 
 const HomePage = () =>{
   return (
    <div className="w-full bg-slate-400 flex justify-between h-screen">
      <UploadSection/>
      <ShowCase/>
    </div>
   )
 }
 
 export default HomePage