import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './src/theme/context';
import HomeScreen from './src/HomeScreen';
import LoginScreen from './src/LoginScreen';
import SignupScreen from './src/SignupScreen';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup" element={<SignupScreen />} />
          <Route path="/" element={<HomeScreen />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
