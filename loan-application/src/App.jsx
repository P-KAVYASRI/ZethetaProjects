import WizardForm from "./components/common/WizardForm";

function App() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#121212] overflow-hidden p-6">
     <div className="absolute inset-0 overflow-hidden">

    <div className="absolute top-[-120px] left-[-120px] w-[350px] h-[350px] bg-[#1DB954]/20 rounded-full blur-3xl animate-pulse"></div>

    <div className="absolute bottom-[-150px] right-[-100px] w-[400px] h-[400px] bg-green-400/10 rounded-full blur-3xl animate-pulse"></div>

    <div className="absolute top-[40%] left-[45%] w-[250px] h-[250px] bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>

   </div>
      <WizardForm />
    </div>
  );
}

export default App;