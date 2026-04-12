/**
 * Generated for: KAN-2
 * @generated
 */


         import React from 'react';
         import PropTypes from 'prop-types';

         /**
          * ErrorMessage component
          * 
          * Handles error message display
          * 
          * @param {object} props - Component props
          * @param {string} props.message - Error message
          * @returns {JSX.Element} Error message component
          */
         const ErrorMessage = ({ message }) => {
            return (
               <div style={{ color: 'red' }}>{message}</div>
            );
         };

         ErrorMessage.propTypes = {
            message: PropTypes.string.isRequired,
         };

         export default ErrorMessage;
         