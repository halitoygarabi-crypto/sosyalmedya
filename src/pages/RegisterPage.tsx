import React from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();

    React.useEffect(() => {
        navigate('/login', { replace: true });
    }, [navigate]);

    return null;
};

export default RegisterPage;
