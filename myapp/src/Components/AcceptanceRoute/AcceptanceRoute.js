import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';

const AcceptanceRoute = () => {
  const location = useLocation();
  const [decodedId, setDecodedId] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const encodedId = queryParams.get('encodedId');
    
    if (encodedId) {
      try {
        const decodedId = atob(encodedId);
        setDecodedId(decodedId);
      } catch (error) {
        console.error('Error decoding Base64:', error);
      }
    }
  }, [location.search]);

  return (
    <div>
      <h1>Acceptance Page</h1>
      {decodedId ? (
        <div>
          <p><strong>Decoded ID:</strong> {decodedId}</p>
          <div>
            <button>Accept</button>
            <button>Reject</button>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default AcceptanceRoute;
