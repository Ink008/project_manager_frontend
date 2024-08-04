import { useCallback, useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import Jdenticon from 'react-jdenticon';
import { components } from 'react-select';
import AsyncSelect from 'react-select/async';

import { DangerToast } from "../../component/toast";
import { FetchGetAPI, FetchPostAPI } from "../../config/config";
import SearchBar from "../../component/searchbar";
import Skeleton from "react-loading-skeleton";
import { Button, ButtonGroup, Modal } from "react-bootstrap";
import { Flag, FlagFill, PersonDashFill, PersonPlusFill } from "react-bootstrap-icons";

function Member() {
    const user = useOutletContext();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [isShowingMemberDialog, setIsShowingMemberDialog] = useState(false);
    const [isShowingRoleDialog, setIsShowingRoleDialog] = useState(false);
    const [isShowingDeleteDialog, setIsShowingDeleteDialog] = useState(false);
    const navigate = useNavigate();

    const refresh = useCallback(async (search = '') => {
        try {
            setIsLoading(true);
            var data = await FetchGetAPI(`/workspace/${id}/member?search=${encodeURIComponent(search)}`);
            setMembers(data);
        } catch (error) {
            DangerToast("Get Data Failed!", error.message);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    const createHandler = async (user_id) => {
        try {
            setIsLoading(true);
            var data = await FetchPostAPI(`/workspace/${id}/member/add`, {
                id: id,
                user_id: user_id,
                is_leader: false
            });
            if (!data.success) throw Error(data.message);
            refresh();
        } catch (error) {
            DangerToast("Add Member Failed!", error.message);
            refresh();
        } finally {
            setIsLoading(false);
        }
    }

    const changeRoleHandler = async (id, user_id, is_leader) => {
        try {
            setIsLoading(true);
            var data = await FetchPostAPI(`/workspace/${id}/member/update`, {
                id: id,
                user_id: user_id,
                is_leader: is_leader
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

    const deleteHandler = async (id, user_id) => {
        try {
            setIsLoading(true);
            var data = await FetchPostAPI(`/workspace/${id}/member/delete`, {
                id: id,
                user_id: user_id
            });
            if (!data.success) throw Error(data.message);
            refresh();
        } catch (error) {
            DangerToast("Delete Member Failed!", error.message);
            refresh();
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (!user.is_manager) {
            navigate('/home');
        }
        refresh();
    }, [user.is_manager, navigate, refresh]);

    return <div className="container mt-3">
        <SearchBar onSearch={(value) => {
            if (!isLoading) {
                refresh(value);
            }
        }} />
        <div className="d-flex justify-content-between align-items-center mt-2">
            <h3 className="App-link m-0">Member</h3>
            {isLoading
                ? <Skeleton width={47.45} height={38.99} />
                : <Button variant="primary"
                    onClick={() => setIsShowingMemberDialog(true)}>
                    <PersonPlusFill size={22} />
                </Button>}
        </div>
        <div className="container">
            {isLoading
                ? Array.from({ length: 5 }).map((_, index) => <Skeleton
                    key={index}
                    containerClassName="row mt-2" height={79.99} />)
                : members.map((member) => <div key={member.id}
                    className="card border-app bg-dark text-light row mt-2">
                    <div className="card-body d-flex justify-content-between align-items-center">
                        <div className="card-text d-flex align-item-center">
                            <Jdenticon size={'48'} value={member.id.toString()} />
                            <a className={`my-0 ms-2 text-decoration-none h5 align-self-center ${member.leader ? 'App-link' : ''}`}
                                href={`/profile/${member.id}`}>
                                {member.username}
                            </a>
                        </div>
                        <ButtonGroup size="sm">
                            <Button variant="primary"
                                onClick={() => {
                                    setSelectedMember(member);
                                    setIsShowingRoleDialog(true);
                                }}>
                                {member.leader ? <FlagFill size={20} /> : <Flag size={20} />}
                            </Button>
                            <Button variant="primary"
                                onClick={() => {
                                    setSelectedMember(member);
                                    setIsShowingDeleteDialog(true);
                                }}>
                                <PersonDashFill size={20} />
                            </Button>
                        </ButtonGroup>
                    </div>
                </div>)}
        </div>

        <MemberDialog
            show={isShowingMemberDialog}
            onHide={() => setIsShowingMemberDialog(false)}
            onSubmit={(user_id) => {
                createHandler(user_id);
                setIsShowingMemberDialog(false);
            }} />

        <RoleDialog
            user={selectedMember}
            show={isShowingRoleDialog}
            onHide={() => setIsShowingRoleDialog(false)}
            onSubmit={() => {
                changeRoleHandler(id, selectedMember.id, !selectedMember.leader);
                setIsShowingRoleDialog(false);
            }} />

        <DeleteDialog
            show={isShowingDeleteDialog}
            onHide={() => setIsShowingDeleteDialog(false)}
            onSubmit={() => {
                deleteHandler(id, selectedMember.id);
                setIsShowingDeleteDialog(false);
            }} />
    </div>;
}

function MemberDialog({ show, onHide, onSubmit }) {
    const [user, setUser] = useState(null);
    return <Modal data-bs-theme="dark" className="text-light"
        show={show} onHide={onHide}>
        <Modal.Header>
            <Modal.Title className="App-link">Invite</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <AsyncSelect autoFocus isClearable className="h5"
                value={user}
                onChange={(user) => setUser(user)}
                placeholder={'Enter Username...'}
                theme={(theme) => ({
                    ...theme,
                    colors: {
                        ...theme.colors,
                        primary25: '#555',
                        primary: '#61dafb',
                        neutral0: '#333',
                        neutral80: '#fff',
                    },
                })} loadOptions={ async (value, callback) => {
                    var data = await FetchGetAPI(`/user/member?search=${encodeURIComponent(value)}`);
                    callback(data.map((user) => ({ 
                        value: user.id, 
                        label: user.username, 
                        icon: user.avatar 
                    })));
                }} components={{Option: (props) => {
                    return (
                      <components.Option {...props} className="d-flex align-item-center">
                        <Jdenticon size={'30'} value={props.data.value.toString()} />
                        <div className="ms-2 align-self-center">{props.data.label}</div>
                      </components.Option>
                    );
                }}}/>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
                Close
            </Button>
            <Button variant="primary" onClick={() => {
                if(user != null) {
                    onSubmit(user.value);
                    setUser(null);
                }
            }}>
                Add
            </Button>
        </Modal.Footer>
    </Modal>
}

function RoleDialog({ user, show, onHide, onSubmit }) {
    return <Modal data-bs-theme="dark" className="text-light"
        show={show} onHide={onHide}>
        <Modal.Header>
            <Modal.Title className="App-link">Change Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            You wanna switch this user role to <span className="App-link">
                {!user ? '' : user.leader ? 'Member' : 'Leader'}
            </span>?
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
                Close
            </Button>
            <Button variant="primary" onClick={onSubmit}>
                Change
            </Button>
        </Modal.Footer>
    </Modal>
}

function DeleteDialog({ show, onHide, onSubmit }) {
    return <Modal data-bs-theme="dark" className="text-light"
        show={show} onHide={onHide}>
        <Modal.Header>
            <Modal.Title className="text-danger">Kick User</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you wanna kick this user?</Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
                Close
            </Button>
            <Button variant="outline-danger" onClick={onSubmit}>
                Kick
            </Button>
        </Modal.Footer>
    </Modal>
}

export default Member;