import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { authService, adminService } from './api'
import Header from './components/Layout/Header'
import Login from './components/UserAuth/Login'
import Register from './components/UserAuth/Register'
import EmailVerification from './components/UserAuth/EmailVerification'
import ForgotPassword from './components/UserAuth/ForgotPassword'
import ResetPassword from './components/UserAuth/ResetPassword'
import ChangePassword from './components/UserAuth/ChangePassword'
import ResumeBuilder from './components/ResumeBuilder/ResumeBuilder'
import ResumePreview from './components/ResumeBuilder/ResumePreview'
import ResumeViewer from './components/ResumeBuilder/ResumeViewer'
import AdminLogin from './components/Admin/AdminLogin'
import AdminDashboard from './components/Admin/AdminDashboard'
import AdminProfile from './components/Admin/AdminProfile'
import UserList from './components/Admin/UserManagement/UserList'
import ResumeList from './components/Admin/ResumeManagement/ResumeList'
import UserDashboard from './components/User/UserDashboard'
import UserProfile from './components/User/UserProfile'
import UserSettings from './components/User/UserSettings'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import APITest from './components/Test/APITest'
import DashboardTest from './components/Test/DashboardTest'
import ResumeAPITest from './components/Test/ResumeAPITest'
import UserAPITest from './components/Test/UserAPITest'
import ProfilePictureTest from './components/Test/ProfilePictureTest'
import AdminAuthTest from './components/Test/AdminAuthTest'
import AdminProfileTest from './components/Test/AdminProfileTest'
import ToastContainer from './components/Common/ToastContainer'

function App() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    setIsVisible(true)
    
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: "🚀",
      title: "Professional Templates",
      description: "Choose from 50+ professionally designed templates"
    },
    {
      icon: "⚡",
      title: "Real-time Preview",
      description: "See your changes instantly with our live preview feature"
    },
    {
      icon: "🎨",
      title: "Custom Styling",
      description: "Personalize colors, fonts, and layouts to match your brand"
    },
    {
      icon: "📱",
      title: "Mobile Responsive",
      description: "Perfect resumes that look great on any device"
    }
  ]

  const LandingPage = () => {

    return (
    <div className="min-h-screen bg-white overflow-hidden relative">
      {/* Animated Background with Vanta-like effects */}
      <div className="fixed inset-0 overflow-hidden">
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-orange-200 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
        
        {/* Wave effect */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-orange-50 to-transparent animate-wave"></div>
        
        {/* Geometric shapes */}
        <div className="absolute top-20 right-20 w-32 h-32 border-2 border-orange-200 rounded-full animate-spin-slow opacity-20"></div>
        <div className="absolute top-40 left-10 w-24 h-24 border-2 border-orange-300 rotate-45 animate-pulse-slow opacity-20"></div>
        <div className="absolute bottom-40 right-10 w-16 h-16 border-2 border-orange-200 rounded-full animate-bounce-slow opacity-20"></div>
      </div>

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Create Your Professional
            <span className="text-orange-500"> Resume</span> in Minutes
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Build stunning resumes with our powerful builder. Choose from professional templates, 
            customize your content, and download your perfect resume instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {authService.isAuthenticated() ? (
              <>
                <Link to="/dashboard" className="btn-primary text-base px-6 py-3">Go to Dashboard</Link>
                <Link to="/resume/create" className="btn-secondary text-base px-6 py-3">Create New Resume</Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-base px-6 py-3">Start Building Now</Link>
                <Link to="/resume/create" className="btn-secondary text-base px-6 py-3">View Templates</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose ResumeCraft?</h2>
            <p className="text-lg text-gray-600">Everything you need to create a standout resume</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`card-minimal text-center transition-all duration-500 ${
                  activeFeature === index ? 'border-orange-300 transform scale-105' : ''
                }`}
              >
                <div className="text-4xl mb-4 animate-bounce-slow">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Land Your Dream Job?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of professionals who have created winning resumes with ResumeCraft
          </p>
          {authService.isAuthenticated() ? (
            <Link to="/dashboard" className="btn-primary text-base px-6 py-3">Go to Dashboard</Link>
          ) : (
            <Link to="/register" className="btn-primary text-base px-6 py-3">Create Your Resume Now</Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-50 border-t border-gray-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center border border-orange-300">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">ResumeCraft</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Create professional resumes that stand out and get you hired.
              </p>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-3 text-sm">Product</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-orange-500 transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-orange-500 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-3 text-sm">Support</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-orange-500 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-6 pt-6 text-center">
            <p className="text-gray-500 text-sm">
              © 2024 ResumeCraft. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/test" element={<APITest />} />
        <Route path="/dashboard-test" element={<DashboardTest />} />
        <Route path="/resume-test" element={<ResumeAPITest />} />
        <Route path="/user-test" element={<UserAPITest />} />
        <Route path="/profile-picture-test" element={<ProfilePictureTest />} />
        <Route path="/admin-auth-test" element={<AdminAuthTest />} />
        <Route path="/admin-profile-test" element={<AdminProfileTest />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email/:verificationtoken" element={<EmailVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
        <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route 
          path="/admin/login" 
          element={
            <ProtectedRoute requireAuth={false} requireAdmin={false}>
              <AdminLogin />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute requireAuth={true} requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute requireAuth={true} requireAdmin={true}>
              <UserList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/resumes" 
          element={
            <ProtectedRoute requireAuth={true} requireAdmin={true}>
              <ResumeList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/profile" 
          element={
            <ProtectedRoute requireAuth={true} requireAdmin={true}>
              <AdminProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/resumes/:id" 
          element={
            <ProtectedRoute requireAuth={true} requireAdmin={true}>
              <ResumeViewer />
            </ProtectedRoute>
          } 
        />
        
        {/* User Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute requireAuth={true}>
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute requireAuth={true}>
              <UserProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute requireAuth={true}>
              <UserSettings />
            </ProtectedRoute>
          } 
        />
        

        <Route 
          path="/resume-builder" 
          element={
            <ProtectedRoute requireAuth={true}>
              <ResumeBuilder />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resume-builder/:id" 
          element={
            <ProtectedRoute requireAuth={true}>
              <ResumeBuilder />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resume/:id" 
          element={
            <ProtectedRoute requireAuth={true}>
              <ResumeViewer />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resume/create" 
          element={
            <ProtectedRoute requireAuth={true}>
              <ResumeBuilder />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resume/preview/:resumeId" 
          element={
            <ProtectedRoute requireAuth={true}>
              <ResumePreview />
            </ProtectedRoute>
          } 
        />
      </Routes>
      <ToastContainer />
    </Router>
  )
}

export default App
