/**
 * Generated for: KAN-2
 * @generated
 */


         import React from 'react';
         import PropTypes from 'prop-types';

         /**
          * LoginButton component
          * 
          * Handles login button with disabled state
          * 
          * @param {object} props - Component props
          * @param {boolean} props.disabled - Disabled state
          * @returns {JSX.Element} Login button component
          */
         const LoginButton = ({ disabled }) => {
            return (
               <button type='submit' disabled={disabled}>
                  Login
               </button>
            );
         };

         LoginButton.propTypes = {
            disabled: PropTypes.bool,
         };

         export default LoginButton;
         