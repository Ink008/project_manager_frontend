import { Button, Form, Modal, Table } from "react-bootstrap";
import { useEffect, useState, useRef } from "react";
import { ArrowLeftRight } from "react-bootstrap-icons";

import SearchBar from "../../component/searchbar";
import Skeleton from "react-loading-skeleton";
import { DangerToast } from "../../component/toast";
import { FetchGetAPI, FetchPostAPI } from "../../config/config";

function WorkspaceTranfer() {
    const [workspaces, setWorkspaces] = useState([]);
    const [managers, setManagers] = useState([]);
    const [selectedManager, setSelectedManager] = useState(null);
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);
    const managerId = useRef('');
    const [isLoading, setIsLoading] = useState(true);
    const [isShowing, setIsShowing] = useState(false);

    const refresh = async (search = '', manager_id = '') => {
        try {
            setIsLoading(true);
            var fetchWorkspaces = await FetchGetAPI(`/workspace?search=${encodeURIComponent(search)}${manager_id === '' ? '' : `&manager_id=${encodeURIComponent(manager_id)}`}`);
            var fetchManagers = await FetchGetAPI(`/user/member?is_leader=true`);
            setWorkspaces(fetchWorkspaces);
            setManagers(fetchManagers);
        } catch (error) {
            DangerToast("Get Data Failed!", error.message);
        } finally {
            setIsLoading(false);
        }
    }

    const tranferHandler = async (id, manager_id, name) => {
        try {
            setIsLoading(true);
            var data = await FetchPostAPI(`/workspace/update`, {
                id: id,
                manager_id: manager_id,
                name: name
            });
            if (!data.success) throw Error(data.message);
            refresh('', managerId.current);
        } catch (error) {
            DangerToast("Tranfer Workspace Failed!", error.message);
            refresh('', managerId.current);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        refresh();
    }, []);

    return <div className="container mt-3">
        <SearchBar onSearch={(value) => {
            if (!isLoading) refresh(value, managerId.current);
        }} />
        <div className="d-flex justify-content-between align-items-center ps-2 my-2">
            <h3 className="m-0 Admin-link">Workspace tranfer</h3>
            <div>
                {isLoading
                    ? <Skeleton width={200} height={37.33} />
                    : <Form.Select data-bs-theme="dark" style={{ minWidth: 200 }}
                        className="border border-light"
                        value={managerId.current}
                        onChange={(e) => {
                            managerId.current = e.target.value;
                            refresh('', managerId.current);
                        }}>
                        <option value={''}>All</option>
                        {managers.map((value) => <option key={value.id} value={value.id}>
                            {`${value.id} - ${value.username}`}
                        </option>)}
                    </Form.Select>}
            </div>
        </div>
        <Table hover={!isLoading} variant="dark"
            className="border border-success">
            <thead>
                <tr>
                    <th>#</th>
                    <th className="text-center">Workspace</th>
                    <th className="text-center">Manager</th>
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
                    </tr>
                }) : workspaces.map((value) => <tr key={value.id}>
                    <td className="align-middle">{value.id}</td>
                    <td className="text-center align-middle">{value.name}</td>
                    <td className="text-center align-middle">{value.manager.username}</td>
                    <td className="text-center align-middle">
                        <Button size="sm" variant="success"
                            onClick={() => {
                                setSelectedManager(value.manager);
                                setSelectedWorkspace(value);
                                setIsShowing(true);
                            }}><ArrowLeftRight size={20} /></Button>
                    </td>
                </tr>)}
            </tbody>
        </Table>


        {/* Tranfer Dialog */}
        <TranferDialog
            manager={selectedManager}
            managers={managers}
            show={isShowing}
            onHide={() => setIsShowing(false)} 
            onSubmit={(manager) => {
                tranferHandler(selectedWorkspace.id, manager.id, selectedWorkspace.name);
                setIsShowing(false);
            }}/>
    </div>
}

function TranferDialog({ manager, managers, show, onHide, onSubmit }) {
    const [managerId, setManagerId] = useState('');

    useEffect(() => {
        setManagerId(manager ? manager.id : '');
    }, [manager]);

    return <Modal centered data-bs-theme="dark" className="text-light"
        show={show} onHide={onHide}>
        <Modal.Header>
            <Modal.Title className="Admin-link">Workspace Tranfer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form id="tranferform" onSubmit={(e) => {
                e.preventDefault();
                managers.forEach(value => {
                    if(value.id.toString() === managerId) onSubmit(value);
                });
            }}>
                <Form.Select data-bs-theme="dark"
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}>
                    {managers.map((value) => <option key={value.id} value={value.id}>
                        {`${value.id} - ${value.username}`}
                    </option>)}
                </Form.Select>
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
                Close
            </Button>
            <Button variant="success" type="submit" form="tranferform">
                Tranfer
            </Button>
        </Modal.Footer>
    </Modal>
}

export default WorkspaceTranfer;