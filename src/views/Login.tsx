import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Mail, Lock, ArrowRight, User ,Eye, EyeOff} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

export const Login: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);

  // Login fields
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [name, setName]               = useState('');
  const [regEmail, setRegEmail]       = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  //VER Y OCULTAR CONTRASEÑA
  const [showPassword, setShowPassword]           = useState(false);
  const [showRegPassword, setShowRegPassword]     = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const navigate    = useNavigate();
  const { login }   = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/my-orders');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(regEmail))
      return setError('Ingresa un correo electrónico válido');
    if (regPassword !== confirmPassword)
      return setError('Las contraseñas no coinciden');
    if (regPassword.length < 8)
      return setError('La contraseña debe tener al menos 8 caracteres');
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
      if (!passwordRegex.test(regPassword))
        return setError('La contraseña debe contener al menos una mayúscula, una minúscula, un número y un símbolo');

    setIsLoading(true);
    try {
      await authService.register(name, regEmail, regPassword);
      setSuccess('¡Cuenta creada! Ya puedes iniciar sesión.');
      // Reset fields and switch to login
      setName(''); setRegEmail(''); setRegPassword(''); setConfirmPassword('');
      setTimeout(() => {
        setIsRegister(false);
        setSuccess('');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-900 rounded-2xl text-white mb-6 shadow-xl shadow-zinc-900/20">
            <LayoutDashboard size={32} />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={isRegister ? 'register-title' : 'login-title'}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
                {isRegister ? 'Crear cuenta' : 'Bienvenido'}
              </h1>
              <p className="text-zinc-500 mt-2">
                {isRegister
                  ? 'Completa los datos para registrarte'
                  : 'Ingresa tus credenciales para acceder'}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Card */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm overflow-hidden">

          {/* Toggle tabs */}
          <div className="flex bg-zinc-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => !isRegister || switchMode()}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                !isRegister ? 'bg-white shadow text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => isRegister || switchMode()}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                isRegister ? 'bg-white shadow text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-600">
              {success}
            </div>
          )}

          <AnimatePresence mode="wait">

            {/* ── LOGIN FORM ── */}
            {!isRegister && (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleLogin}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                    <Mail size={16} className="text-zinc-400" />
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="nombre@empresa.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                    <Lock size={16} className="text-zinc-400" />
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pr-10"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-0 h-full flex items-center text-zinc-400 hover:text-zinc-700">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary py-3 flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Ingresar</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {/* ── REGISTER FORM ── */}
            {isRegister && (
              <motion.form
                key="register-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleRegister}
                noValidate
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                    <User size={16} className="text-zinc-400" />
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                    <Mail size={16} className="text-zinc-400" />
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="input-field"
                    placeholder="nombre@empresa.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                    <Lock size={16} className="text-zinc-400" />
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword  ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="input-field pr-10"
                      placeholder="Minimo 8 caracteres"
                    />
                    <button type="button" onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-0 h-full flex items-center text-zinc-400 hover:text-zinc-700">
                      {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                    <Lock size={16} className="text-zinc-400" />
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword  ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field pr-10"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-0 h-full flex items-center text-zinc-400 hover:text-zinc-700">
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary py-3 flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Crear cuenta</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-zinc-400 mt-8">
          &copy; 2026 OrderFlow. Todos los derechos reservados.
        </p>
      </motion.div>
    </div>
  );
};