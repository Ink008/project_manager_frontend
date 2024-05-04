import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form } from "react-bootstrap";

import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { FetchPostAPI } from '../../config/config';
import { DangerToast } from "../../component/toast";

function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const LoginHandler = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            var data = await FetchPostAPI('/admin', {
                username: username,
                password: password
            });
            if (!data) throw new Error('Please checked the user again!');

            // Đăng nhập thành công
            sessionStorage.setItem('admin', JSON.stringify(data));
            navigate('dashboard');
        } catch (error) {
            DangerToast("Login Failed!", error.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div style={{ 'minHeight': '100vh' }} className="d-flex flex-column align-items-center justify-content-center">
            {/* Color: #61fb80 */}
            <img className='App-logo' src="/adminlogo.svg" alt="Logo"
                style={{ filter: 'brightness(0) saturate(100%) invert(71%) sepia(100%) saturate(282%) hue-rotate(72deg) brightness(101%) contrast(97%)' }} />
            <br />
            <br />
            <Form onSubmit={LoginHandler}>
                <Form.Group className='mb-3'>
                    <Form.Control type="text" placeholder="Username" value={username} autoFocus
                        onChange={(e) => setUsername(e.target.value)} />
                </Form.Group>
                <Form.Group className='mb-3'>
                    <Form.Control type="password" placeholder="Password" value={password}
                        onChange={(e) => setPassword(e.target.value)} />
                </Form.Group>
                <div className='text-center'>
                    {isLoading ?
                        <Skeleton height={37.47} /> : <Button variant="success" type="submit">
                            Login
                        </Button>}
                </div>
            </Form>
        </div>
    );
}

export default Login;