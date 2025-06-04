import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Lock, Mail } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    console.log('Form submitted with', email, password); // 👈 ajout

    if (!email || !password) {
      setError('Veuillez renseigner votre email et votre mot de passe.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Calling login()...'); // 👈 ajout
      const { success, message } = await login(email, password);
      console.log('Login result:', success, message); // 👈 ajout
      if (success) {
        navigate('/dashboard');
      } else {
        setError(message);
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center">
            <Shield className="h-10 w-10 text-primary-600" />
          </div>
        </div>
        <h2 className="mt-8 text-center text-3xl font-bold text-brand-dark">
          ABK Review
        </h2>
        <p className="mt-3 text-center text-lg text-gray-600">
          Accédez à votre espace client
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-card rounded-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="form-label">
                Adresse email
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input pl-12"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Mot de passe
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-12"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn btn-primary"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-brand-dark mr-2"></div>
                    Connexion en cours...
                  </div>
                ) : (
                  'Connexion'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  Vous n'avez pas de compte ?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-base text-gray-600">
                Contactez-nous via le site principal :{' '}
                <a
                  href="https://abk-review.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary-600 hover:text-primary-700"
                >
                  abk-review.com
                </a>
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Pour la démo, utilisez : demo@abk-review.com / demo123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;