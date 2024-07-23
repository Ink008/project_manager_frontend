import { Plus, Pen, Trash, X, Check} from "react-bootstrap-icons";
import { useEffect, useState } from "react";
import { Button, ButtonGroup, Form, Modal } from "react-bootstrap";
import AsyncSelect from 'react-select/async';
import Jdenticon from 'react-jdenticon';
import { components } from 'react-select';
import SearchBar from "../../component/searchbar";
import Skeleton from "react-loading-skeleton";
import { FetchGetAPI, FetchPostAPI } from "../../config/config";
import { DangerToast } from "../../component/toast";

function WorkspaceManager() {
    const [isLoading, setIsLoading] = useState(true);
    const [workspaces, setWorkspaces] = useState([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);
    const [workspaceName, setWorkspaceName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isShowingDialog, setIsShowingDialog] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);


    const refresh = async (search = '') => {
        try {
            setIsLoading(true);
            const data = await FetchGetAPI(`/workspace?&search=${encodeURIComponent(search)}`);
            setWorkspaces(data);
        } catch (error) {
            DangerToast("Get Data Failed!", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const createHandler = async (manager_id, name) => {
        try {
            setIsLoading(true);
            const data = await FetchPostAPI(`/workspace/add`, {
                manager_id: manager_id,
                name: name
            });
            if (!data.success) throw Error(data.message);
            refresh();
        } catch (error) {
            DangerToast("Add Workspace Failed!", error.message);
            refresh();
        } finally {
            setIsLoading(false);
        }
    };

    const updateHandler = async (id, manager_id, name) => {
        try {
            setIsLoading(true);
            const data = await FetchPostAPI(`/workspace/update`, {
                id: id,
                manager_id: manager_id,
                name: name
            });
            if (!data.success) throw Error(data.message);
            refresh();
        } catch (error) {
            DangerToast("Update Workspace Failed!", error.message);
            refresh();
        } finally {
            setIsLoading(false);
        }
    };

    const deleteHandler = async (id) => {
        try {
            setIsLoading(true);
            const data = await FetchGetAPI(`/workspace/delete?id=${id}`);
            if (!data.success) throw Error(data.message);
            refresh();
        } catch (error) {
            DangerToast("Delete User Failed!", error.message);
            refresh();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, []);

    return (
        <div className="container mt-3">
            <SearchBar onSearch={(value) => {
                if (!isLoading) {
                    refresh(value);
                }
            }} />
            <div className="d-flex justify-content-between align-items-center my-2">
            <h3 className="Admin-link m-0">Workspaces Management</h3>
                    <AddDialog
                        show={isCreating}
                        onHide={() => setIsCreating(false)}
                        onSubmit={({ workspaceName, managerId }) => {
                            createHandler(managerId, workspaceName);
                            setIsCreating(false);
                        }}
                    />
                {isLoading ? (
                    <Skeleton width={55.45} height={43.46} />
                ) : (
                    <ButtonGroup>
                        {!isCreating ? (
                            <Button variant="success" onClick={() => setIsCreating(true)}>
                                <Plus size={30} />
                            </Button>
                        ) : (
                            <Button variant="success" onClick={() => setIsCreating(false)}>
                                <X size={30} />
                            </Button>
                        )}
                    </ButtonGroup>
                )}
            </div>
            <div className="container">
            {isLoading
                ? Array.from({ length: 5 }).map((_, index) => <Skeleton
                    key={index}
                    containerClassName="row mt-2" height={63.51} />)
                : workspaces.map((workspace) => <div key={workspace.id}
                    className="card border-admin bg-dark text-light row mt-2">
                    <div className="card-body d-flex justify-content-between align-items-center">
                        <div>
                            {editingIndex !== workspace.id
                                ? <h5 className="card-text m-0 h5 text-decoration-none">
                                    {workspace.name}
                                </h5>
                                : <Form id="edit-form"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if(workspace.name !== workspaceName){
                                            updateHandler(workspace.id, workspace.manager.id, workspaceName);
                                            setEditingIndex(null);
                                        }
                                    }}>
                                    <input autoFocus required
                                        className="h5 m-0"
                                        data-bs-theme="dark"
                                        value={workspaceName}
                                        onChange={(e) => setWorkspaceName(e.target.value)} />
                                </Form>}
                        </div>
                        <ButtonGroup size="sm">
                            {editingIndex !== workspace.id
                                ? <>
                                    <Button variant="success"
                                        onClick={() => {
                                            setWorkspaceName(workspace.name)
                                            setEditingIndex(workspace.id);
                                        }}>
                                        <Pen size={20}></Pen>
                                    </Button>
                                    <Button variant="success"
                                        onClick={() => {
                                            setSelectedWorkspace(workspace);
                                            setIsShowingDialog(true);
                                        }}>
                                        <Trash size={20}></Trash>
                                    </Button>
                                </>
                                : <>
                                    <Button form="edit-form" type="submit" variant="success">
                                        <Check size={20}></Check>
                                    </Button>
                                    <Button variant="success"
                                        onClick={() => setEditingIndex(null)}>
                                        <X size={20}></X>
                                    </Button></>}
                        </ButtonGroup>
                    </div>
                </div>)}
        </div>

            <DeleteDialog
                show={isShowingDialog}
                onHide={setIsShowingDialog}
                onSubmit={() => {
                    setIsShowingDialog(false);
                    deleteHandler(selectedWorkspace.id);
                }}
            />
        </div>
    );
}

function DeleteDialog({ show, onHide, onSubmit }) {
    return (
        <Modal data-bs-theme="dark" className="text-light" show={show} onHide={onHide}>
            <Modal.Header>
                <Modal.Title className="text-danger">Delete Workspace</Modal.Title>
            </Modal.Header>
            <Modal.Body>Are you sure you want to delete this workspace?</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => onHide(false)}>
                    Close
                </Button>
                <Button variant="outline-danger" onClick={onSubmit}>
                    Delete
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

function AddDialog({ show, onHide, onSubmit }) {
    const [workspaceName, setWorkspaceName] = useState('');
    const [selectedManager, setSelectedManager] = useState(null);
    const [managers, setManagers] = useState([]);

    useEffect(() => {
        if (show) {
            const fetchManagers = async () => {
                try {
                    const data = await FetchGetAPI(`/user/member?is_leader=true`);
                    setManagers(data);
                } catch (error) {
                    DangerToast("Get Managers Failed!", error.message);
                }
            };
            fetchManagers();
        }
    }, [show]);

    return (
        <Modal data-bs-theme="dark" className="text-light" show={show} onHide={onHide}>
            <Modal.Header>
                <Modal.Title className="Admin-link">Invite</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                   <input  type="text"
                        className="h5"
                        placeholder="Enter Workspace Name..."
                        value={workspaceName}
                        style={{width : "100%"}}
                        onChange={(e) => setWorkspaceName(e.target.value)}></input>
                </Form.Group>
                <br/>
                <Form.Group>
                    <AsyncSelect
                        autoFocus
                        isClearable
                        className="h5"
                        placeholder={'Enter Manager Name...'}
                        value={selectedManager}
                        onChange={(manager) => setSelectedManager(manager)}
                        loadOptions={(inputValue, callback) => {
                            const filteredManagers = managers.filter(manager =>
                                manager.username.toLowerCase().includes(inputValue.toLowerCase())
                            );
                            callback(filteredManagers.map(manager => ({
                                value: manager.id,
                                label: manager.username,
                                icon: manager.avatar
                            })));
                        }}
                        components={{ Option: (props) => (
                            <components.Option {...props} className="d-flex align-items-center">
                                <Jdenticon size={'30'} value={props.data.value.toString()} />
                                <div className="ms-2 align-self-center">{props.data.label}</div>
                            </components.Option>
                        )}}
                        theme={(theme) => ({
                            ...theme,
                            colors: {
                                ...theme.colors,
                                primary25: '#555',
                                primary: '#61fb80',
                                neutral0: '#333',
                                neutral80: '#fff',
                            },
                        })}
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => {
                    setWorkspaceName('');
                    setSelectedManager(null);
                    onHide();
                }}>
                    Close
                </Button>
                <Button variant="success" onClick={() => {
                    if (workspaceName && selectedManager) {
                        onSubmit({ workspaceName, managerId: selectedManager.value });
                        setWorkspaceName('');
                        setSelectedManager(null);
                    }
                }}>
                    Add
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default WorkspaceManager;
