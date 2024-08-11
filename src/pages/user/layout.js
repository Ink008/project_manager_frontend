import { Nav, Navbar, NavDropdown, OverlayTrigger } from "react-bootstrap";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Button from 'react-bootstrap/Button';
import Popover from 'react-bootstrap/Popover';
import Container from 'react-bootstrap/Container';
import { Bell, BellFill } from "react-bootstrap-icons";
import { useNavigate, Outlet } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import Skeleton from 'react-loading-skeleton';
import Jdenticon from 'react-jdenticon';
import { Scrollbar } from 'react-scrollbars-custom';

import { FetchGetAPI } from '../../config/config';
import { DangerToast } from '../../component/toast';
import TaskNotifications from './task_notifications';

function Layout() {
    const user_id = JSON.parse(sessionStorage.getItem("user_id"));
    const icon_size = 48;
    const navbar_height = 68;
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    const getUserInfo = useCallback(async () => {
        try {
            setIsLoading(true);
            var data = await FetchGetAPI(`/user/id=${user_id}`);
            if (!data) throw new Error('There is something wrong with backend!');
            setUser(data);
        } catch (error) {
            DangerToast("Get User Profile Failed!", error.message);
        } finally {
            setIsLoading(false);
        }
    }, [user_id]);

    useEffect(() => {
        if (user_id == null) {
            navigate('/');
            return;
        }
        getUserInfo();
    }, [user_id, navigate, getUserInfo]);

    return <Scrollbar>
        {window.location.pathname === '/' ? <></> :
            <Navbar id='topbar' sticky="top" style={{ height: navbar_height }} bg="dark" data-bs-theme="dark" className='border-bottom'>
                <Container fluid>
                    <Navbar.Brand>
                        <img className='Spinning-logo' height={icon_size} width={icon_size} src="/logo.svg" alt="Logo"
                            style={{ filter: 'brightness(0) saturate(100%) invert(76%) sepia(7%) saturate(3467%) hue-rotate(160deg) brightness(102%) contrast(97%)' }} />
                    </Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link href='/home'>
                            <b className='h5 App-link'>Home</b>
                        </Nav.Link>
                    </Nav>
                    {isLoading
                        ? <></>
                        : <NotificationsButton />}
                    <div className="justify-content-end ms-4">
                        {isLoading
                            ? <Skeleton containerClassName='d-flex align-item-center' height={icon_size} width={icon_size} />
                            : <Nav>
                                <NavDropdown align={'end'} className='hidden-arrow-dropdown'
                                    title={
                                        <Jdenticon size={icon_size.toString()} value={user.id.toString()} />
                                    }>
                                    <NavDropdown.Item className='h5 m-0'
                                        href={`/profile/${user_id}`}>Profile</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item className='text-danger h5 m-0'
                                        href='/' onClick={() => sessionStorage.removeItem('user_id')}>Log Out</NavDropdown.Item>
                                </NavDropdown>
                            </Nav>}
                    </div>
                </Container>
            </Navbar>}
        <div className='bg-dark h-100'>
            {window.location.pathname !== '/' && user == null
                ? <div style={{ height: `calc(100vh - ${navbar_height}px)` }}>
                    <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="spinner-border App-link" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div> : <Outlet context={user} />}
        </div>
    </Scrollbar>
}

function NotificationsButton() {
    const [show, setShow] = useState(false);
    const [target, setTarget] = useState(null);

    const handleClick = (event) => {
        setShow(!show);
        setTarget(event.target);
    };

    const handleClose = () => {
        setShow(false);
    };

    const popover = (
        <Popover data-bs-theme="dark" 
            style={{'--bs-popover-max-width': '480px'}}
            className='w-100'
        >
            <Popover.Header className='text-light'>
                <div className='text-center h5 mb-0'>
                    Notifications
                </div>
            </Popover.Header>
            <Popover.Body>
                <Tabs defaultActiveKey={'Tasks'} fill className='d-flex flex-row'>
                    <Tab eventKey={'Tasks'} title={<div className='h5 mb-0'>Tasks</div>}>
                        <div className="border rounded-bottom">
                            <TaskNotifications />
                        </div>
                    </Tab>
                </Tabs>
            </Popover.Body>
        </Popover>
    );

    return (
        <OverlayTrigger
            trigger="click"
            placement="bottom-end"
            overlay={popover}
            show={show}
            target={target}
            onToggle={handleClose}
            rootClose
        >
            <Button
                variant='dark'
                className='rounded-circle'
                onClick={handleClick}
            >
                {show? <BellFill size={25} /> : <Bell size={25} />}
            </Button>
        </OverlayTrigger>
    );
}

export default Layout;