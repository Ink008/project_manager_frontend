import { useState } from "react";
import { Button, Form } from "react-bootstrap";

import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div style={{ 'minHeight': '100vh' }} className="d-flex flex-column align-items-center justify-content-center">
            {/* Color: #61dafb */}
            <img className='App-logo Spinning-logo' src="/logo.svg" alt="Logo"
                style={{ filter: 'brightness(0) saturate(100%) invert(76%) sepia(7%) saturate(3467%) hue-rotate(160deg) brightness(102%) contrast(97%)' }} />
            <br />
            <br />
            <Form onSubmit={(e) => {
                e.preventDefault();
                setIsLoading(true);
            }}>
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
                        <Skeleton height={37.47} /> : <Button variant="primary" type="submit">
                            Login
                        </Button>}
                </div>
            </Form>
        </div>
    );
}

export default Login;