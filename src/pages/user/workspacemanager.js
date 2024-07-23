import {PeopleFill, X, Check } from "react-bootstrap-icons";
import { useEffect, useState } from "react";
import { Button, ButtonGroup, Form, Modal } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

import SearchBar from "../../component/searchbar";
import Skeleton from "react-loading-skeleton";
import { FetchGetAPI, FetchPostAPI } from "../../config/config";
import { DangerToast } from "../../component/toast";

function WorkspaceManager() {
    const user_id = JSON.parse(sessionStorage.getItem("user_id"));
    const [isLoading, setIsLoading] = useState(true);
    const [workspaces, setWorkspaces] = useState([]);
    const [selectedWorkspace] = useState(null);
    const [workspaceName, setWorkspaceName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isShowingDialog, setIsShowingDialog] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const navigate = useNavigate();

    const refresh = async (manager_id, search = '') => {
        try {
            setIsLoading(true);
            var data = await FetchGetAPI(`/workspace?manager_id=${encodeURIComponent(manager_id)}&search=${encodeURIComponent(search)}`);
            setWorkspaces(data);
        } catch (error) {
            DangerToast("Get Data Failed!", error.message);
        } finally {
            setIsLoading(false);
        }
    }

    const createHandler = async (manager_id, name) => {
        try {
            setIsLoading(true);
            var data = await FetchPostAPI(`/workspace/add`, {
                manager_id: manager_id,
                name: name
            });
            if (!data.success) throw Error(data.message);
            refresh(user_id);
        } catch (error) {
            DangerToast("Add Workspace Failed!", error.message);
            refresh(user_id);
        } finally {
            setIsLoading(false);
        }
    }

    const updateHandler = async (id, manager_id, name) => {
        try {
            setIsLoading(true);
            var data = await FetchPostAPI(`/workspace/update`, {
                id: id,
                manager_id: manager_id,
                name: name
            });
            if (!data.success) throw Error(data.message);
            refresh(user_id);
        } catch (error) {
            DangerToast("Update Workspace Failed!", error.message);
            refresh(user_id);
        } finally {
            setIsLoading(false);
        }
    }

    const deleteHandler = async (id) => {
        try {
            setIsLoading(true);
            var data = await FetchGetAPI(`/workspace/delete?id=${id}`);
            if (!data.success) throw Error(data.message);
            refresh(user_id);
        } catch (error) {
            DangerToast("Delete User Failed!", error.message);
            refresh(user_id);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        refresh(user_id);
    }, [user_id]);

    return <div className="container mt-3">
        <SearchBar onSearch={(value) => {
            if (!isLoading) {
                refresh(user_id, value);
            }
        }} />
        <div className="d-flex justify-content-between align-items-center my-2">
            {!isCreating
                ? <h3 className="App-link m-0">Workspaces Management</h3>
                : <Form id="create-form" onSubmit={(e) => {
                    e.preventDefault();
                    const name = (new FormData(e.target)).get('name');
                    setIsCreating(false);
                    createHandler(user_id, name);
                }}>
                    <input autoFocus required
                        name="name"
                        className="h3 m-0 App-link"
                        data-bs-theme="dark"
                        placeholder="Enter new workspace" />
                </Form>}
            {isLoading
                ? <Skeleton width={55.45} height={43.46} />
                : <ButtonGroup>
                    {!isCreating
                        ? <>
                        {/* <Button variant="primary"
                            onClick={() => setIsCreating(true)}><Plus size={30} /></Button> */}
                        </>
                        : <>
                            <Button form="create-form" type="submit" variant="primary">
                                <Check size={30} />
                            </Button>
                            <Button variant="primary"
                                onClick={() => setIsCreating(false)}>
                                <X size={30} />
                            </Button>
                        </>}
                </ButtonGroup>}
        </div>
        <div className="container">
            {isLoading
                ? Array.from({ length: 5 }).map((_, index) => <Skeleton
                    key={index}
                    containerClassName="row mt-2" height={63.51} />)
                : workspaces.map((workspace) => <div key={workspace.id}
                    className="card border-app bg-dark text-light row mt-2">
                    <div className="card-body d-flex justify-content-between align-items-center">
                        <div>
                            {editingIndex !== workspace.id
                                ? <Link className="card-text m-0 h5 text-decoration-none"
                                    to={`/workspace/${encodeURIComponent(workspace.id)}`}>
                                    {workspace.name}
                                </Link>
                                : <Form id="edit-form"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        updateHandler(workspace.id, workspace.manager.id, workspaceName);
                                        setEditingIndex(null);
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
                                    <Button variant="primary"
                                        onClick={() => navigate(`/workspace/${workspace.id}/member`)}>
                                        <PeopleFill size={20}></PeopleFill>
                                    </Button>
                                    {/* <Button variant="primary"
                                        onClick={() => {
                                            setWorkspaceName(workspace.name)
                                            setEditingIndex(workspace.id);
                                        }}>
                                        <Pen size={20}></Pen>
                                    </Button>
                                    <Button variant="primary"
                                        onClick={() => {
                                            setSelectedWorkspace(workspace);
                                            setIsShowingDialog(true);
                                        }}>
                                        <Trash size={20}></Trash>
                                    </Button> */}
                                </>
                                : <>
                                    <Button form="edit-form" type="submit" variant="primary">
                                        <Check size={20}></Check>
                                    </Button>
                                    <Button variant="primary"
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
            }} />
    </div>
}

function DeleteDialog({ show, onHide, onSubmit }) {
    return <Modal data-bs-theme="dark" className="text-light"
        show={show} onHide={onHide}>
        <Modal.Header>
            <Modal.Title className="text-danger">Delete Workspace</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you wanna delete this workspace?</Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => onHide(false)}>
                Close
            </Button>
            <Button variant="outline-danger" onClick={onSubmit}>
                Delete
            </Button>
        </Modal.Footer>
    </Modal>
}

export default WorkspaceManager;