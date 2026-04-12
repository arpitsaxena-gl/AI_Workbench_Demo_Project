/**
 * Generated for: KAN-2
 * @generated
 */


         import React from 'react';
         import PropTypes from 'prop-types';

         /**
          * EmailInput component
          * 
          * Handles email input with validation
          * 
          * @param {object} props - Component props
          * @param {function} props.register - Register function from react-hook-form
          * @param {object} props.error - Error object from react-hook-form
          * @param {string} props.value - Email value
          * @param {function} props.onChange - Change event handler
          * @returns {JSX.Element} Email input component
          */
         const EmailInput = ({ register, error, value, onChange }) => {
            return (
               <div>
                  <label htmlFor='email'>Email:</label>
                  <input
                     type='email'
                     id='email'
                     {...register('email', { required: true, pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/ })}
                     value={value}
                     onChange={onChange}
                  />
                  {error && <div>{error.message}</div>}
               </div>
            );
         };

         EmailInput.propTypes = {
            register: PropTypes.func.isRequired,
            error: PropTypes.object,
            value: PropTypes.string,
            onChange: PropTypes.func.isRequired,
         };

         export default EmailInput;
         