/**
 * Generated for: KAN-2
 * @generated
 */


         import React from 'react';
         import PropTypes from 'prop-types';

         /**
          * PasswordInput component
          * 
          * Handles password input with validation
          * 
          * @param {object} props - Component props
          * @param {function} props.register - Register function from react-hook-form
          * @param {object} props.error - Error object from react-hook-form
          * @param {string} props.value - Password value
          * @param {function} props.onChange - Change event handler
          * @returns {JSX.Element} Password input component
          */
         const PasswordInput = ({ register, error, value, onChange }) => {
            return (
               <div>
                  <label htmlFor='password'>Password:</label>
                  <input
                     type='password'
                     id='password'
                     {...register('password', { required: true, minLength: 8 })}
                     value={value}
                     onChange={onChange}
                  />
                  {error && <div>{error.message}</div>}
               </div>
            );
         };

         PasswordInput.propTypes = {
            register: PropTypes.func.isRequired,
            error: PropTypes.object,
            value: PropTypes.string,
            onChange: PropTypes.func.isRequired,
         };

         export default PasswordInput;
         