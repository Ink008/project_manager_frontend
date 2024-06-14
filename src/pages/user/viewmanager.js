import { Check, Flag, FlagFill, Pen, PeopleFill, Plus, Trash, X } from "react-bootstrap-icons";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Button, ButtonGroup, Form, Modal } from "react-bootstrap";
import Jdenticon from 'react-jdenticon';
import { components } from 'react-select';
import AsyncSelect from 'react-select/async';

import SearchBar from "../../component/searchbar";
import Skeleton from "react-loading-skeleton";
import { DangerToast } from "../../component/toast";
import { FetchGetAPI, FetchPostAPI } from "../../config/config";

function ViewManager() {
    const user = useOutletContext();
    const { id } = useParams();
    const [views, setViews] = useState([]);
    const [viewName, setViewName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [selectedView, setSelectedView] = useState(null);
    const [isShowingLeaderDialog, setIsShowingLeaderDialog] = useState(false);
    const [isShowingDialog, setIsShowingDialog] = useState(false);
    const navigate = useNavigate();

    const refresh = useCallback(async (search = '') => {
        try {
            setIsLoading(true);
            var params = user.is_manager
                ? `workspace_id=${encodeURIComponent(id)}`
                : `user_id=${encodeURIComponent(user.id)}`;
            var data = await FetchGetAPI(`/view?${params}&search=${encodeURIComponent(search)}`);
            var display = [];
            while (data.length) display.push(data.splice(0, 3));
            setViews(display);
        } catch (error) {
            DangerToast("Get Data Failed!", error.message);
        } finally {
            setIsLoading(false);
        }
    }, [id, user.id, user.is_manager]);

    const addHandler = async (name) => {
        try {
            setIsLoading(true);
            var data = await FetchPostAPI(`/view/add`, {
                workspace_id: id,
                user_id: null,
                name: name
            });
            if (!data.success) throw Error(data.message);
            refresh();
        } catch (error) {
            DangerToast("Add View Failed!", error.message);
            refresh();
        } finally {
            setIsLoading(false);
        }
    }

    const updateHandler = async (id, leader_id, name) => {
        try {
            setIsLoading(true);
            var data = await FetchPostAPI(`/view/update`, {
                id: id,
                user_id: leader_id,
                name: name
            });
            if (!data.success) throw Error(data.message);
            refresh();
        } catch (error) {
            DangerToast("Update View Failed!", error.message);
            refresh();
        } finally {
            setIsLoading(false);
        }
    }

    const leaderHandler = async (id, user_id, name) => {
        try {
            setIsLoading(true);
            var data = await FetchPostAPI(`/view/update`, {
                id: id,
                user_id: user_id,
                name: name
            });
            if (!data.success) throw Error(data.message);
            refresh();
        } catch (error) {
            DangerToast("Assign Leader Failed!", error.message);
            refresh();
        } finally {
            setIsLoading(false);
        }
    }

    const deleteHandler = async (id) => {
        try {
            setIsLoading(true);
            var data = await FetchPostAPI(`/view/delete`, {
                id: id
            });
            if (!data.success) throw Error(data.message);
            refresh();
        } catch (error) {
            DangerToast("Delete View Failed!", error.message);
            refresh();
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (!user.is_manager && window.location.pathname !== '/home') {
            navigate('/home');
        }
        refresh();
    }, [user.is_manager, navigate, refresh])

    return <div className="container mt-3">
        <SearchBar onSearch={(value) => {
            if (!isLoading) {
                refresh(value);
            }
        }} />
        <div className="d-flex justify-content-between align-items-center mt-2">
            {!isCreating
                ? <h3 className="App-link m-0">Views Management</h3>
                : <Form id="create-form" onSubmit={(e) => {
                    e.preventDefault();
                    const name = (new FormData(e.target)).get('name');
                    setIsCreating(false);
                    //Create
                    addHandler(name);
                }}>
                    <input autoFocus required
                        name="name"
                        className="h3 m-0 App-link"
                        data-bs-theme="dark"
                        placeholder="Enter new view" />
                </Form>}
            {isLoading
                ? <Skeleton width={55.45} height={43.46} />
                : user.is_manager
                    ? <ButtonGroup>
                        {!isCreating
                            ? <Button variant="primary"
                                onClick={() => setIsCreating(true)}><Plus size={30} /></Button>
                            : <>
                                <Button form="create-form" type="submit" variant="primary">
                                    <Check size={30} />
                                </Button>
                                <Button variant="primary"
                                    onClick={() => setIsCreating(false)}>
                                    <X size={30} />
                                </Button>
                            </>}
                    </ButtonGroup>
                    : <></>}
        </div>
        {isLoading
            ? Array.from({ length: 2 }).map((_, index) => <div key={index} className="row">
                {Array.from({ length: 3 }).map((_, index) => <div key={index} className="col-lg-4 mt-2">
                    <Skeleton height={185.07} />
                </div>)}
            </div>)
            : views.map((row, index) => <div key={index} className="row">
                {row.map((view) => <div key={view.id} className="col-lg-4 mt-2 d-flex">
                    <div className="card text-center border-app bg-dark text-light flex-fill">
                        <div className="card-body d-flex flex-column justify-content-between">
                            {editingIndex !== view.id
                                ? <h4 className="card-title">{view.name}</h4>
                                : <Form id="edit-form" onSubmit={(e) => {
                                    e.preventDefault();
                                    setEditingIndex(null);
                                    updateHandler(view.id, view.leader != null ? view.leader.id : null, viewName);
                                }}>
                                    <input autoFocus required
                                        className="h4 text-center"
                                        data-bs-theme="dark"
                                        value={viewName}
                                        onChange={(e) => setViewName(e.target.value)} />
                                </Form>}
                            <p className="card-text">
                                Leader: {view.leader == null ? 'None' : view.leader.username}
                            </p>
                            <div>
                                <div>
                                    <ButtonGroup className="w-100">
                                        {editingIndex !== view.id
                                            ? <>
                                                {user.is_manager ? <>
                                                    <Button variant="dark"
                                                    onClick={() => {
                                                        setSelectedView(view);
                                                        setIsShowingLeaderDialog(true);
                                                    }}>
                                                        {view.leader 
                                                        ? <FlagFill size={20} /> 
                                                        : <Flag size={20} />}
                                                    </Button>
                                                    <Button variant="dark"
                                                        onClick={() => {
                                                            setViewName(view.name);
                                                            setEditingIndex(view.id);
                                                        }}>
                                                        <Pen size={20}></Pen>
                                                    </Button>
                                                    <Button variant="dark"
                                                        onClick={() => {
                                                            setSelectedView(view);
                                                            setIsShowingDialog(true);
                                                        }}>
                                                        <Trash size={20}></Trash>
                                                    </Button>
                                                </> : <Button variant="dark"
                                                    onClick={() => navigate(`/view/${view.id}/member`)}>
                                                    <PeopleFill size={20}></PeopleFill>
                                                </Button>}
                                            </>
                                            : <>
                                                <Button form="edit-form" type="submit" variant="dark">
                                                    <Check size={20}></Check>
                                                </Button>
                                                <Button variant="dark"
                                                    onClick={() => setEditingIndex(null)}>
                                                    <X size={20}></X>
                                                </Button></>}
                                    </ButtonGroup>
                                </div>
                                <div>
                                    <Button className="w-100"
                                        onClick={() => navigate(`/view/${view.id}`)}>
                                        Details
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>)}
            </div>)}

        <LeaderDialog
            view={selectedView}
            show={isShowingLeaderDialog}
            onHide={setIsShowingLeaderDialog}
            onSubmit={(user_id) => {
                leaderHandler(selectedView.id, user_id, selectedView.name);
                setIsShowingLeaderDialog(false);
            }} />

        <DeleteDialog
            show={isShowingDialog}
            onHide={setIsShowingDialog}
            onSubmit={() => {
                setIsShowingDialog(false);
                deleteHandler(selectedView.id);
            }} />
    </div>
}

function LeaderDialog({ view, show, onHide, onSubmit }) {
    const { id } = useParams();
    const [user, setUser] = useState(null);

    useEffect(() => {
        if(show) {
            const leader = view ? view.leader : null;
            setUser(leader == null ? null : {
                value: leader.id, 
                label: leader.username, 
                icon: leader.avatar 
            });
        }
    }, [show, view])

    return <Modal data-bs-theme="dark" className="text-light"
        show={show} onHide={onHide}>
        <Modal.Header>
            <Modal.Title className="App-link">Leader</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <AsyncSelect autoFocus isClearable className="h5"
                value={user}
                onChange={(user) => setUser(user)}
                placeholder={'None'}
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
                    var data = await FetchGetAPI(`/workspace/${id}/member?search=${encodeURIComponent(value)}`);
                    data = data.filter(value => value.leader === true);
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
            <Button variant="secondary" onClick={() => onHide(false)}>
                Close
            </Button>
            <Button variant="primary" onClick={() => {
                onSubmit(user != null ? user.value : null);
            }}>
                Assign
            </Button>
        </Modal.Footer>
    </Modal>
}

function DeleteDialog({ show, onHide, onSubmit }) {
    return <Modal data-bs-theme="dark" className="text-light"
        show={show} onHide={onHide}>
        <Modal.Header>
            <Modal.Title className="text-danger">Delete View</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you wanna delete this view?</Modal.Body>
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

export default ViewManager;