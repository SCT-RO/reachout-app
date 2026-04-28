import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import Toast from './components/Toast';

import SplashScreen from './screens/SplashScreen';
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import CourseDetailScreen from './screens/CourseDetailScreen';
import CartScreen from './screens/CartScreen';
import PaymentScreen from './screens/PaymentScreen';
import PaymentSuccessScreen from './screens/PaymentSuccessScreen';
import MyLearningScreen from './screens/MyLearningScreen';
import LessonPlayerScreen from './screens/LessonPlayerScreen';
import QuizScreen from './screens/QuizScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import SubmitAssignmentScreen from './screens/SubmitAssignmentScreen';
import AssignmentSuccessScreen from './screens/AssignmentSuccessScreen';
import HelpSupportScreen from './screens/HelpSupportScreen';
import ModulesScreen from './screens/ModulesScreen';
import ModuleDetailScreen from './screens/ModuleDetailScreen';
import SubmoduleScreen from './screens/SubmoduleScreen';
import ContentPlayerScreen from './screens/ContentPlayerScreen';

// Phone frame reads dark mode + toast from context
function PhoneFrame({ children }) {
  const { isDark, toast } = useApp();
  return (
    <div className="rapp">
      <div className={`phone-frame${isDark ? '' : ' light-mode'}`}>
        <AnimatePresence>{toast && <Toast message={toast.message} type={toast.type} />}</AnimatePresence>
        {children}
      </div>
    </div>
  );
}

function ProtectedPage({ children }) {
  return (
    <ProtectedRoute>
      <PhoneFrame>{children}</PhoneFrame>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PhoneFrame><SplashScreen /></PhoneFrame>} />
      <Route path="/auth" element={<PhoneFrame><AuthScreen /></PhoneFrame>} />

      <Route path="/home"       element={<ProtectedPage><HomeScreen /></ProtectedPage>} />
      <Route path="/course/:id" element={<ProtectedPage><CourseDetailScreen /></ProtectedPage>} />
      <Route path="/cart"       element={<ProtectedPage><CartScreen /></ProtectedPage>} />
      <Route path="/payment"    element={<ProtectedPage><PaymentScreen /></ProtectedPage>} />
      <Route path="/success"    element={<ProtectedPage><PaymentSuccessScreen /></ProtectedPage>} />
      <Route path="/learn"      element={<ProtectedPage><MyLearningScreen /></ProtectedPage>} />
      <Route path="/lesson/:id" element={<ProtectedPage><LessonPlayerScreen /></ProtectedPage>} />
      <Route path="/quiz/:id"   element={<ProtectedPage><QuizScreen /></ProtectedPage>} />
      <Route path="/profile"                    element={<ProtectedPage><ProfileScreen /></ProtectedPage>} />
      <Route path="/profile/edit"               element={<ProtectedPage><EditProfileScreen /></ProtectedPage>} />
      <Route path="/profile/password"           element={<ProtectedPage><ChangePasswordScreen /></ProtectedPage>} />
      <Route path="/profile/assignment"         element={<ProtectedPage><SubmitAssignmentScreen /></ProtectedPage>} />
      <Route path="/profile/assignment/success" element={<ProtectedPage><AssignmentSuccessScreen /></ProtectedPage>} />
      <Route path="/profile/support"            element={<ProtectedPage><HelpSupportScreen /></ProtectedPage>} />

      <Route path="/course/:courseId/modules"                                          element={<ProtectedPage><ModulesScreen /></ProtectedPage>} />
      <Route path="/course/:courseId/module/:moduleId"                                 element={<ProtectedPage><ModuleDetailScreen /></ProtectedPage>} />
      <Route path="/course/:courseId/module/:moduleId/submodule/:submoduleId"          element={<ProtectedPage><SubmoduleScreen /></ProtectedPage>} />
      <Route path="/course/:courseId/content/:contentId"                               element={<ProtectedPage><ContentPlayerScreen /></ProtectedPage>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
