import { useCallback, useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import Jdenticon from 'react-jdenticon';
import { components } from 'react-select';
import AsyncSelect from 'react-select/async';

import { DangerToast } from "../../component/toast";
import { FetchGetAPI } from "../../config/config";
import SearchBar from "../../component/searchbar";
import Skeleton from "react-loading-skeleton";
import { Button, ButtonGroup, Modal } from "react-bootstrap";
import { PersonDashFill, PersonPlusFill } from "react-bootstrap-icons";

function Permission() {
    const user = useOutletContext();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState({});
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [isShowingMemberDialog, setIsShowingMemberDialog] = useState(false);
    const [isShowingDeleteDialog, setIsShowingDeleteDialog] = useState(false);
    const navigate = useNavigate();

    const refresh = useCallback(async (search = '') => {
        try {
            setIsLoading(true);
            var data = await FetchGetAPI(`/view/${id}/member?search=${encodeURIComponent(search)}`);
            setMembers(data);
            data = await FetchGetAPI(`/view/id=${encodeURIComponent(id)}`);
            setView(data);
        } catch (error) {
            DangerToast("Get Data Failed!", error.message);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    const createHandler = async (user_id) => {
        try {
            setIsLoading(true);
            var data = await FetchGetAPI(`/view/${id}/member/add?member_id=${encodeURIComponent(user_id)}`);
            if (!data.success) throw Error(data.message);
            refresh();
        } catch (error) {
            DangerToast("Add Member Failed!", error.message);
            refresh();
        } finally {
            setIsLoading(false);
        }
    }

    const deleteHandler = async (user_id) => {
        try {
            setIsLoading(true);
            var data = await FetchGetAPI(`/view/${id}/member/delete?member_id=${encodeURIComponent(user_id)}`);
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
        if (user.is_manager) {
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
                : view.leader?.id !== user.id
                    ? <></>
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
                            <a className="my-0 ms-2 h5 align-self-center text-decoration-none"
                                href={`/profile/${member.id}`}>
                                {member.username}
                            </a>
                        </div>
                        {view.leader?.id !== user.id
                            ? <></>
                            : <ButtonGroup size="sm">
                                <Button variant="primary"
                                    onClick={() => {
                                        setSelectedMember(member);
                                        setIsShowingDeleteDialog(true);
                                    }}>
                                    <PersonDashFill size={20} />
                                </Button>
                            </ButtonGroup>}
                    </div>
                </div>)}
        </div>

        <MemberDialog
            show={isShowingMemberDialog}
            onHide={() => setIsShowingMemberDialog(false)}
            onSubmit={(user_id) => {
                createHandler(user_id);
                setIsShowingMemberDialog(false);
            }} 
            view={view} />

        <DeleteDialog
            show={isShowingDeleteDialog}
            onHide={() => setIsShowingDeleteDialog(false)}
            onSubmit={() => {
                deleteHandler(selectedMember.id);
                setIsShowingDeleteDialog(false);
            }} />
    </div>;
}

function MemberDialog({ view, show, onHide, onSubmit }) {
    const [user, setUser] = useState(null);
    const [workspaceID, setWorkspaceID] = useState(null);

    useEffect(() => {
        if(show) {
            setWorkspaceID(view.workspace_id);
        }
    }, [show, view])
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
                    var data = await FetchGetAPI(`/workspace/${workspaceID}/member?search=${encodeURIComponent(value)}`);
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

export default Permission;