import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-slate-50">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md mx-auto mb-3">
            <span className="text-2xl">🍚</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Welcome to RiceShare</h1>
          <p className="text-xs text-slate-500 mt-1">Sign in to reserve discounted meals or list surplus food</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary: 'bg-amber-600 hover:bg-amber-700 text-white font-bold',
              card: 'shadow-xl rounded-3xl border border-slate-200',
            },
          }}
        />
      </div>
    </div>
  );
}
