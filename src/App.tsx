import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const Home = lazy(() => import("./pages/Home"));
const Rooms = lazy(() => import("./pages/Rooms"));
const RoomDetails = lazy(() => import("./pages/RoomDetails"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Amenities = lazy(() => import("./pages/Amenities"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Contact = lazy(() => import("./pages/Contact"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const BookingSearch = lazy(() => import("./pages/BookingSearch"));
const Register = lazy(() => import("./pages/Register"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const Profile = lazy(() => import("./pages/Profile"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen font-sans bg-slate-50 text-slate-900">
        <Navbar />
        <main className="flex-grow">
          <Suspense
            fallback={
              <div className="min-h-[50vh] flex items-center justify-center text-slate-600">
                Loading page...
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/rooms/:id" element={<RoomDetails />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/amenities" element={<Amenities />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/book/:id" element={<BookingPage />} />
              <Route path="/booking-search" element={<BookingSearch />} />
              <Route path="/register" element={<Register />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
