import Container from 'react-bootstrap/Container';
import { Button, Nav, Navbar } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import UserManager from "./usermanager";
import WorkspaceTranfer from './workspacetranfer';

function Dashboard() {
    const admin = JSON.parse(sessionStorage.getItem("admin"));
    const icon_size = 48;
    const navigate = useNavigate();
    const [isHome, setIsHome] = useState(true);

    useEffect(() => {
        if(!admin) {
            navigate('/admin');
        }
    }, [admin, navigate]);

    return <>
        <Navbar sticky="top" style={{height: '68px'}} bg="dark" data-bs-theme="dark" className='border-bottom'>
            <Container fluid>
            <Navbar.Brand>
            <img height={icon_size} width={icon_size} src="/adminlogo.svg" alt="Logo"
                style={{ filter: 'brightness(0) saturate(100%) invert(71%) sepia(100%) saturate(282%) hue-rotate(72deg) brightness(101%) contrast(97%)' }} />
            </Navbar.Brand>
            <Nav className="me-auto">
                <Nav.Link onClick={() => {if(!isHome) setIsHome(true)}}>
                    <b className='h5 Admin-link'>Home</b>
                </Nav.Link>
                <Nav.Link onClick={() => {if(isHome) setIsHome(false)}}>
                    <b className='h5 Admin-link'>Workspace transfer</b>
                </Nav.Link>
            </Nav>
            <div className="justify-content-end">
                <Button variant='outline-danger'
                onClick={() => {
                    sessionStorage.removeItem('admin');
                    navigate('/admin');
                }}>
                    <b className='h5'>Log out</b>
                </Button>
            </div>
            </Container>
        </Navbar>
        <div className='bg-dark'>
            {isHome ? <UserManager/> : <WorkspaceTranfer/>}
        </div>
    </>
}

export default Dashboard;