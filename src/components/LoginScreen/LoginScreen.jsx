/**
 * Generated for: KAN-2
 * @generated
 */


         import React, { useState, useEffect } from 'react';
         import { useForm } from 'react-hook-form';
         import { useAuth } from '../hooks/useAuth';
         import EmailInput from '../EmailInput/EmailInput';
         import PasswordInput from '../PasswordInput/PasswordInput';
         import LoginButton from '../LoginButton/LoginButton';
         import ForgotPasswordLink from '../ForgotPasswordLink/ForgotPasswordLink';
         import SignUpLink from '../SignUpLink/SignUpLink';
         import ErrorMessage from '../ErrorMessage/ErrorMessage';
         import Loader from '../Loader/Loader';
         import styles from './LoginScreen.module.css';

         /**
          * LoginScreen component
          * 
          * Handles user login with email and password authentication
          * 
          * @returns {JSX.Element} Login screen component
          */
         const LoginScreen = () => {
            const { register, handleSubmit, errors } = useForm();
            const { login, isLoading, error } = useAuth();
            const [email, setEmail] = useState('');
            const [password, setPassword] = useState('');

            const onSubmit = async (data) => {
               try {
                  await login(data.email, data.password);
               } catch (error) {
                  console.error(error);
               }
            };

            return (
               <div className={styles.container}>
                  <form onSubmit={handleSubmit(onSubmit)}>
                     <EmailInput
                        register={register}
                        error={errors.email}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                     />
                     <PasswordInput
                        register={register}
                        error={errors.password}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                     />
                     {error && <ErrorMessage message={error.message} />}
                     <LoginButton disabled={isLoading} />
                     {isLoading && <Loader />}
                     <ForgotPasswordLink />
                     <SignUpLink />
                  </form>
               </div>
            );
         };

         export default LoginScreen;
         