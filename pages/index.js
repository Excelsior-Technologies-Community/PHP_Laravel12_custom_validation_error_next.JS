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

  const [avatar, setAvatar] = useState("https://api.dicebear.com/7.x/micah/svg?seed=User");
  const [emailStatus, setEmailStatus] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [pwdStrength, setPwdStrength] = useState(0);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (form.email.includes("@")) {
        setEmailStatus("checking");
        try {
          const res = await axios.post("http://127.0.0.1:8000/api/check-email", { email: form.email });
          setEmailStatus(res.data.available ? "available" : "taken");
        } catch (err) {
          setEmailStatus(null);
        }
      } else {
        setEmailStatus(null);
      }
    }, 800);
    return () => clearTimeout(delayDebounceFn);
  }, [form.email]);

  const checkStrength = (pass) => {
    let score = 0;
    if (!pass) return setPwdStrength(0);
    if (pass.length > 5) score += 20;
    if (pass.length > 7) score += 20;
    if (/[A-Z]/.test(pass)) score += 20;
    if (/[0-9]/.test(pass)) score += 20;
    if (/[^A-Za-z0-9]/.test(pass)) score += 20;
    setPwdStrength(score);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    let newErrors = { ...errors };

    if (name === "name") {
      setAvatar(`https://api.dicebear.com/7.x/micah/svg?seed=${value || "User"}`);
      if (value.length < 3) {
        newErrors.name = ["Minimum 3 characters required"];
      } else {
        delete newErrors.name;
      }
    }

    if (name === "email") {
      if (!value.includes("@")) {
        newErrors.email = ["Email must contain @"];
      } else {
        delete newErrors.email;
      }
    }

    if (name === "password") {
      checkStrength(value);
      if (value.length < 8) {
        newErrors.password = ["Minimum 8 characters required"];
      } else {
        delete newErrors.password;
      }
    }

    if (name === "password" || name === "password_confirmation") {
      const p1 = name === "password" ? value : form.password;
      const p2 = name === "password_confirmation" ? value : form.password_confirmation;
      if (p2 && p1 !== p2) {
        newErrors.password_confirmation = ["Passwords do not match"];
      } else {
        delete newErrors.password_confirmation;
      }
    }

    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emailStatus === "taken") return;
    setErrors({});
    setSuccess("");
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/register", form);
      setSuccess(res.data.message);
      setForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: ""
      });
      setAvatar("https://api.dicebear.com/7.x/micah/svg?seed=User");
      setPwdStrength(0);
      setEmailStatus(null);
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      }
    }
    setLoading(false);
  };

  const getStrengthColor = () => {
    if (pwdStrength <= 20) return "bg-danger";
    if (pwdStrength <= 60) return "bg-warning";
    return "bg-success";
  };

  const getStrengthLabel = () => {
    if (pwdStrength === 0) return "";
    if (pwdStrength <= 20) return "Too Weak";
    if (pwdStrength <= 60) return "Getting Better";
    if (pwdStrength <= 80) return "Strong";
    return "Very Strong";
  };

  return (
    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow-lg border-0" style={{ borderRadius: "20px", overflow: "hidden" }}>
            <div className="card-header bg-dark text-white text-center py-4 border-0">
              <img 
                src={avatar} 
                alt="Avatar" 
                width="90" 
                height="90" 
                className="bg-light rounded-circle mb-3 shadow" 
                style={{ border: "4px solid white", transition: "all 0.4s ease" }} 
              />
              <h4 className="mb-0 fw-bold">Create Account</h4>
            </div>

            <div className="card-body p-4 bg-white">
              {success && <div className="alert alert-success fw-bold text-center">{success}</div>}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label className="fw-bold text-muted small text-uppercase">Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    className={`form-control form-control-lg ${errors.name ? 'is-invalid' : ''}`} 
                    value={form.name} 
                    onChange={handleChange} 
                  />
                  {errors.name && <small className="text-danger fw-bold">{errors.name}</small>}
                </div>

                <div className="mb-3 position-relative">
                  <label className="fw-bold text-muted small text-uppercase">Email Address</label>
                  <input 
                    type="text" 
                    name="email" 
                    className={`form-control form-control-lg ${errors.email || emailStatus === 'taken' ? 'is-invalid' : emailStatus === 'available' ? 'is-valid' : ''}`} 
                    value={form.email} 
                    onChange={handleChange} 
                  />
                  {emailStatus === "checking" && <small className="text-info fw-bold">Checking availability...</small>}
                  {emailStatus === "taken" && <small className="text-danger fw-bold">This email is already taken!</small>}
                  {emailStatus === "available" && <small className="text-success fw-bold">Email is available!</small>}
                  {errors.email && <small className="text-danger fw-bold d-block">{errors.email}</small>}
                </div>

                <div className="mb-3 position-relative">
                  <label className="fw-bold text-muted small text-uppercase">Password</label>
                  <div className="input-group">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password" 
                      className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`} 
                      value={form.password} 
                      onChange={handleChange} 
                    />
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary px-3" 
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {pwdStrength > 0 && (
                    <div className="mt-2">
                      <div className="progress" style={{ height: "8px", borderRadius: "10px" }}>
                        <div 
                          className={`progress-bar ${getStrengthColor()}`} 
                          style={{ width: `${pwdStrength}%`, transition: "width 0.4s ease" }}
                        ></div>
                      </div>
                      <small className={`fw-bold mt-1 d-block ${pwdStrength <= 60 ? 'text-warning' : 'text-success'}`}>
                        {getStrengthLabel()}
                      </small>
                    </div>
                  )}
                  {errors.password && <small className="text-danger fw-bold">{errors.password}</small>}
                </div>

                <div className="mb-4">
                  <label className="fw-bold text-muted small text-uppercase">Confirm Password</label>
                  <input 
                    type="password" 
                    name="password_confirmation" 
                    className={`form-control form-control-lg ${errors.password_confirmation ? 'is-invalid' : ''}`} 
                    value={form.password_confirmation} 
                    onChange={handleChange} 
                  />
                  {errors.password_confirmation && <small className="text-danger fw-bold">{errors.password_confirmation}</small>}
                </div>

                <button 
                  className="btn btn-dark btn-lg w-100 py-3 fw-bold" 
                  style={{ borderRadius: "12px" }} 
                  disabled={loading || emailStatus === "taken"}
                >
                  {loading ? "Creating Account..." : "Sign Up"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}