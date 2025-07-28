import CTFPlatform from '@/components/CTFPlatform';
import AuthProvider from '@/components/AuthProvider';

const App = () => {
  return (
    <AuthProvider>
      <CTFPlatform />
    </AuthProvider>
  );
};

export default App;