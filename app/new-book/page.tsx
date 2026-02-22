import TopNav from "../components/TopNav";
import NewBookWizard from "./NewBookWizard";

export default function NewBookPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <TopNav />
      <NewBookWizard />
    </div>
  );
}
