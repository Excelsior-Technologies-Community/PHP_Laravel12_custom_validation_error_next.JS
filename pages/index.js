import { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: ""
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    password_confirmation: false
  });

  // Debounced email check
  useEffect(() => {
    if (form.email && touched.email && form.email.includes('@')) {
      const timeoutId = setTimeout(() => {
        checkEmailAvailability();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setEmailAvailable(null);
    }
  }, [form.email, touched.email]);

  // Password strength checker
  useEffect(() => {
    if (form.password) {
      calculatePasswordStrength(form.password);
    } else {
      setPasswordStrength(0);
    }
  }, [form.password]);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 12.5;
    if (password.match(/[@$!%*#?&]/)) strength += 12.5;
    
    setPasswordStrength(Math.min(100, strength));
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return 'danger';
    if (passwordStrength <= 50) return 'warning';
    if (passwordStrength <= 75) return 'info';
    return 'success';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 25) return 'Weak';
    if (passwordStrength <= 50) return 'Fair';
    if (passwordStrength <= 75) return 'Good';
    return 'Strong';
  };

  const checkEmailAvailability = async () => {
    if (!form.email || !form.email.includes('@')) return;
    
    setEmailChecking(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/check-email", {
        email: form.email
      });
      setEmailAvailable(res.data.available);
    } catch (error) {
      setEmailAvailable(false);
    } finally {
      setEmailChecking(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    
    // Clear specific field error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: undefined
      });
    }
  };

  const handleBlur = (field) => {
    setTouched({
      ...touched,
      [field]: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess("");

    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      password: true,
      password_confirmation: true
    });

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/register",
        form
      );

      setSuccess(res.data.message);
      setForm({ 
        name: "", 
        email: "", 
        password: "", 
        password_confirmation: "" 
      });
      setEmailAvailable(null);
      setPasswordStrength(0);
      setTouched({
        name: false,
        email: false,
        password: false,
        password_confirmation: false
      });
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(""), 5000);

    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: ["Something went wrong. Please try again."] });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-lg border-0 rounded-3">
            <div className="card-header bg-gradient bg-primary text-white text-center py-4 rounded-top-3">
              <h3 className="mb-0">Create Account</h3>
              <p className="mb-0 opacity-75">Join us today!</p>
            </div>

            <div className="card-body p-4">
              {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  {success}
                  <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
                </div>
              )}

              {errors.general && (
                <div className="alert alert-danger">
                  {errors.general[0]}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Name Field */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-person-fill me-1"></i> Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    className={`form-control ${touched.name && errors.name ? 'is-invalid' : touched.name && !errors.name && form.name ? 'is-valid' : ''}`}
                    value={form.name}
                    onChange={handleChange}
                    onBlur={() => handleBlur('name')}
                    placeholder="Enter your full name"
                  />
                  {touched.name && errors.name && (
                    <div className="invalid-feedback">{errors.name[0]}</div>
                  )}
                  {touched.name && !errors.name && form.name && (
                    <div className="valid-feedback">Looks good!</div>
                  )}
                </div>

                {/* Email Field with Availability Check */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-envelope-fill me-1"></i> Email Address
                  </label>
                  <div className="input-group">
                    <input
                      type="email"
                      name="email"
                      className={`form-control ${touched.email && errors.email ? 'is-invalid' : touched.email && emailAvailable === true && !errors.email ? 'is-valid' : ''}`}
                      value={form.email}
                      onChange={handleChange}
                      onBlur={() => handleBlur('email')}
                      placeholder="your@email.com"
                    />
                    {emailChecking && (
                      <span className="input-group-text bg-light">
                        <span className="spinner-border spinner-border-sm"></span>
                      </span>
                    )}
                    {touched.email && emailAvailable === true && !errors.email && (
                      <span className="input-group-text bg-success text-white">
                        <i className="bi bi-check-lg"></i>
                      </span>
                    )}
                    {touched.email && emailAvailable === false && (
                      <span className="input-group-text bg-danger text-white">
                        <i className="bi bi-x-lg"></i>
                      </span>
                    )}
                  </div>
                  {touched.email && errors.email && (
                    <div className="invalid-feedback d-block">{errors.email[0]}</div>
                  )}
                  {touched.email && emailAvailable === true && !errors.email && (
                    <small className="text-success d-block mt-1">
                      <i className="bi bi-check-circle-fill me-1"></i> Email is available
                    </small>
                  )}
                  {touched.email && emailAvailable === false && (
                    <small className="text-danger d-block mt-1">
                      <i className="bi bi-x-circle-fill me-1"></i> Email is already taken
                    </small>
                  )}
                </div>

                {/* Password Field with Strength Meter */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-lock-fill me-1"></i> Password
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className={`form-control ${touched.password && errors.password ? 'is-invalid' : touched.password && passwordStrength >= 75 && !errors.password ? 'is-valid' : ''}`}
                      value={form.password}
                      onChange={handleChange}
                      onBlur={() => handleBlur('password')}
                      placeholder="Create a strong password"
                    />
                    <button 
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`bi bi-eye${showPassword ? '-slash' : ''}-fill`}></i>
                    </button>
                  </div>
                  
                  {/* Password Strength Meter */}
                  {form.password && (
                    <div className="mt-2">
                      <div className="progress" style={{ height: '5px' }}>
                        <div 
                          className={`progress-bar bg-${getStrengthColor()}`}
                          style={{ width: `${passwordStrength}%` }}
                          role="progressbar"
                        ></div>
                      </div>
                      <small className={`text-${getStrengthColor()} d-block mt-1`}>
                        Password Strength: {getStrengthText()}
                      </small>
                      <small className="text-muted d-block">
                        <i className="bi bi-info-circle-fill me-1"></i>
                        Must contain 8+ chars, uppercase, lowercase, number & special char
                      </small>
                    </div>
                  )}
                  
                  {touched.password && errors.password && (
                    <div className="invalid-feedback d-block">{errors.password[0]}</div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-lock-fill me-1"></i> Confirm Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password_confirmation"
                    className={`form-control ${touched.password_confirmation && errors.password ? 'is-invalid' : touched.password_confirmation && form.password === form.password_confirmation && form.password_confirmation ? 'is-valid' : ''}`}
                    value={form.password_confirmation}
                    onChange={handleChange}
                    onBlur={() => handleBlur('password_confirmation')}
                    placeholder="Confirm your password"
                  />
                  {touched.password_confirmation && form.password !== form.password_confirmation && form.password_confirmation && (
                    <div className="invalid-feedback d-block">Passwords do not match</div>
                  )}
                  {touched.password_confirmation && form.password === form.password_confirmation && form.password_confirmation && (
                    <div className="valid-feedback d-block">Passwords match</div>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-2 fw-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus-fill me-2"></i>
                      Register Now
                    </>
                  )}
                </button>
              </form>

              <hr className="my-4" />
              <p className="text-center text-muted mb-0">
                Already have an account? <a href="#" className="text-primary">Sign In</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.2) !important;
        }
      `}</style>
    </div>
  );
}