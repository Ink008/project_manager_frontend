import { Plus, Pen, Trash, Flag, FlagFill } from "react-bootstrap-icons";
import { Button, ButtonGroup, Table, Modal, Form, FloatingLabel } from "react-bootstrap";
import { useState, useEffect } from "react";
import { DangerToast } from "../../component/toast";

import { FetchGetAPI, FetchPostAPI } from "../../config/config";
import Skeleton from "react-loading-skeleton";
import SearchBar from "../../component/searchbar";

function UserManager() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isShowingUserDialog, setIsShowingUserDialog] = useState(false);
    const [isShowingRoleDialog, setIsShowingRoleDialog] = useState(false);
    const [isShowingDeleteDialog, setIsShowingDeleteDialog] = useState(false);

    const refresh = async (search = '') => {
        try {
            setIsLoading(true);
            var data = await FetchGetAPI(`/user?search=${encodeURIComponent(search)}`);
            setUsers(data);
        } catch (error) {
            DangerToast("Get Data Failed!", error.message);
        } finally {
            setIsLoading(false);
        }
    }

    const createHandler = async (username, password, firstname, lastname) => {
        try {
            setIsLoading(true);
            var data = await FetchPostAPI(`/user/add`, {
                username: username,
                password: password,
                firstname: firstname,
                lastname: lastname,
                is_manager: false
            });
            if (!data.success) throw Error(data.message);
            refresh();
        } catch (error) {
            DangerToast("Add User Failed!", error.message);
            refresh();
        } finally {
            setIsLoading(false);
        }
    }

    const updateHandler = async (user_id, username, password, firstname, lastname) => {
        try {
            setIsLoading(true);
            var data = await FetchPostAPI(`/user/update`, {
                id: user_id,
                username: username,
                password: password,
                firstname: firstname,
                lastname: lastname
            });
            if (!data.success) throw Error(data.message);
            refresh();
        } catch (error) {
            DangerToast("Update User Failed!", error.message);
            refresh();
        } finally {
            setIsLoading(false);
        }
    }

    const changeRoleHandler = async (user_id, is_manager) => {
        try {
            setIsLoading(true);
            var data = await FetchPostAPI(`/user/update_manager`, {
                id: user_id,
                is_manager: is_manager
            });
            if (!data.success) throw Error(data.message);
            refresh();
        } catch (error) {
            DangerToast("Change Role Failed!", error.message);
            refresh();
        } finally {
            setIsLoading(false);
        }
    }

    const deleteHandler = async (user_id) => {
        try {
            setIsLoading(true);
            var data = await FetchGetAPI(`/user/delete?id=${user_id}`);
            if (!data.success) throw Error(data.message);
            refresh();
        } catch (error) {
            DangerToast("Delete User Failed!", error.message);
            refresh();
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        refresh();
    }, []);

    return <div className="container mt-3">
        <SearchBar onSearch={(value) => {
            if (!isLoading) refresh(value);
        }} />
        <div className="d-flex justify-content-between align-items-end ps-2 my-2">
            <h3>User Management</h3>
            <Button variant="success"
                onClick={() => {
                    setSelectedUser(null);
                    setIsShowingUserDialog(true);
                }}><Plus size={30} /></Button>
        </div>
        <Table hover={!isLoading} variant="dark"
            className="border border-admin">
            <thead>
                <tr>
                    <th>#</th>
                    <th className="text-center">Username</th>
                    <th className="text-center">Password</th>
                    <th className="text-center">First Name</th>
                    <th className="text-center">Last Name</th>
                    <th className="text-center">Role</th>
                    <th className="text-center">Actions</th>
                </tr>
            </thead>
            <tbody>
                {isLoading ? Array.from({ length: 8 }).map((_, index) => {
                    return <tr style={{ height: 48.25 }} key={index}>
                        <td className="align-middle"><Skeleton /></td>
                        <td className="align-middle"><Skeleton /></td>
                        <td className="align-middle"><Skeleton /></td>
                        <td className="align-middle"><Skeleton /></td>
                        <td className="align-middle"><Skeleton /></td>
                        <td className="align-middle"><Skeleton /></td>
                        <td className="align-middle"><Skeleton /></td>
                    </tr>
                }) : users.map((user) => <tr key={user.id}>
                    <td className="align-middle">{user.id}</td>
                    <td className="text-center align-middle">{user.username}</td>
                    <td className="text-center align-middle">{user.password}</td>
                    <td className="text-center align-middle">{user.firstname}</td>
                    <td className="text-center align-middle">{user.lastname}</td>
                    <td className="text-center align-middle">
                        <i>{user.is_manager ? 'Manager' : 'User'}</i>
                    </td>
                    <td className="text-center align-middle">
                        <ButtonGroup size="sm">
                            <Button variant="secondary"
                                onClick={() => {
                                    setSelectedUser(user);
                                    setIsShowingRoleDialog(true)
                                }}>
                                {!user.is_manager ? <Flag size={20} /> : <FlagFill size={20} />}
                            </Button>
                            <Button variant="success"
                                onClick={() => {
                                    setSelectedUser(user);
                                    setIsShowingUserDialog(true);
                                }}><Pen size={20} /></Button>
                            <Button variant="danger"
                                onClick={() => {
                                    setSelectedUser(user);
                                    setIsShowingDeleteDialog(true)
                                }}>
                                <Trash size={20} />
                            </Button>
                        </ButtonGroup>
                    </td>
                </tr>)}
            </tbody>
        </Table>


        {/* User Dialog */}
        <UserDialog
            user={selectedUser}
            show={isShowingUserDialog}
            onHide={() => setIsShowingUserDialog(false)}
            onSubmit={(is_valid, username, password, firstname, lastname) => {
                if(is_valid) {
                    selectedUser ? 
                    updateHandler(selectedUser.id, username, password, firstname, lastname) :
                    createHandler(username, password, firstname, lastname);
                    setIsShowingUserDialog(false);
                }
            }} />

        {/* Delete Dialog */}
        <DeleteDialog
            show={isShowingDeleteDialog}
            onHide={() => setIsShowingDeleteDialog(false)}
            onSubmit={() => {
                deleteHandler(selectedUser.id)
                setIsShowingDeleteDialog(false);
            }} />

        {/* Change Role Dialog */}
        <RoleDialog
            user={selectedUser}
            show={isShowingRoleDialog}
            onHide={() => setIsShowingRoleDialog(false)}
            onSubmit={() => {
                changeRoleHandler(selectedUser.id, !selectedUser.is_manager);
                setIsShowingRoleDialog(false);
            }} />
    </div>
}

function UserDialog({ user, show, onHide, onSubmit }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');

    useEffect(() => {
        setUsername(user ? user.username : '');
        setPassword(user ? user.password : '');
        setFirstname(user ? user.firstname : '');
        setLastname(user ? user.lastname : '');
    }, [user]);

    return <Modal centered data-bs-theme="dark" className="text-light"
        show={show} onHide={onHide}>
        <Modal.Header>
            <Modal.Title className="Admin-link">{user ? 'Edit' : 'Create'} User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form id="userform" onSubmit={(e) => {
                e.preventDefault();
                onSubmit(e.target.checkValidity(), username, password, firstname, lastname);
            }}>
                <FloatingLabel
                    controlId="floatingUsername"
                    label="Username"
                    className="mb-3"
                >
                    <Form.Control autoFocus type="text" placeholder="Username"
                        required value={username} 
                        onChange={(e) => setUsername(e.target.value)} />
                </FloatingLabel>
                <FloatingLabel
                    controlId="floatingPassword"
                    label="Password"
                    className="mb-3"
                >
                    <Form.Control type="text" placeholder="Password"
                        required value={password} 
                        onChange={(e) => setPassword(e.target.value)} />
                </FloatingLabel>
                <FloatingLabel
                    controlId="floatingFirstname"
                    label="First name"
                    className="mb-3"
                >
                    <Form.Control type="text" placeholder="First name"
                        required value={firstname}
                        onChange={(e) => setFirstname(e.target.value)} />
                </FloatingLabel>
                <FloatingLabel controlId="floatingLastname" label="Last name">
                    <Form.Control type="text" placeholder="Last name"
                        required value={lastname}
                        onChange={(e) => setLastname(e.target.value)} />
                </FloatingLabel>
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
                Close
            </Button>
            <Button variant="success" type="submit" form="userform">
                {user ? 'Edit' : 'Create'}
            </Button>
        </Modal.Footer>
    </Modal>
}

function RoleDialog({ user, show, onHide, onSubmit }) {
    return <Modal data-bs-theme="dark" className="text-light"
        show={show} onHide={onHide}>
        <Modal.Header>
            <Modal.Title className="Admin-link">Change Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            You wanna switch this user role to <span className="Admin-link">
                {!user ? '' : user.is_manager ? 'User' : 'Manager'}
            </span>?
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
                Close
            </Button>
            <Button variant="success" onClick={onSubmit}>
                Change
            </Button>
        </Modal.Footer>
    </Modal>
}

function DeleteDialog({ show, onHide, onSubmit }) {
    return <Modal data-bs-theme="dark" className="text-light"
        show={show} onHide={onHide}>
        <Modal.Header>
            <Modal.Title className="text-danger">Delete User</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you wanna delete this user?</Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
                Close
            </Button>
            <Button variant="outline-danger" onClick={onSubmit}>
                Delete
            </Button>
        </Modal.Footer>
    </Modal>
}

export default UserManager;