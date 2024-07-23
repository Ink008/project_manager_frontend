/* eslint-disable eqeqeq */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FetchGetAPI, FetchPostAPI } from "../../config/config";
import { DangerToast } from "../../component/toast";
import { Container, Card, Button, Form } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { format } from 'date-fns';

function TaskDetail() {
    const { id } = useParams();
    const location = useLocation();
    const viewId = location.state?.viewId;
    const userId = location.state?.userId;
    const [task, setTask] = useState({});
    const [statuses, setStatuses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [members, setMembers] = useState([]);
    const [editedTask, setEditedTask] = useState({
        name: "",
        description: "",
        due_date: "",
        reminder_date: "",
        status_id: "",
        assigner_id: ""
    });
    const [leader, setLeader] = useState(null);

    useEffect(() => {
        fetchTaskDetail();
        fetchMembers();
        fetchLeader();
        if (viewId) {
            fetchStatuses(viewId).then(setStatuses);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, viewId]);

    const fetchMembers = async () => {
        try {
            const response = await FetchGetAPI(`/view/${viewId}/member`);
            setMembers(response);
        } catch (error) {
            DangerToast("Failed to fetch members!", error.message);
        }
    };

    const fetchLeader = async () => {
        try {
            const response = await FetchGetAPI(`/view/id=${viewId}`);
            setLeader(response.leader);
            console.log("Leader ID:", response.leader.id);
        } catch (error) {
            DangerToast("No Leader!");
        }
    };

    const fetchTaskDetail = async () => {
        try {
            setIsLoading(true);
            const data = await FetchGetAPI(`/task?id=${id}`);
            setTask(data);
            setEditedTask({
                name: data.name,
                description: data.description,
                due_date: data.due_date,
                reminder_date: data.reminder_date,
                status_id: data.status_id,
                assigner_id: data.assigner?.id || ""
            });
        } catch (error) {
            DangerToast("Failed to fetch task details!", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStatuses = async (viewId) => {
        try {
            const response = await FetchGetAPI(`/status?view_id=${viewId}`);
            return response;
        } catch (error) {
            DangerToast("Failed to fetch statuses!", error.message);
            return [];
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedTask({
            name: task.name,
            description: task.description,
            due_date: task.due_date,
            reminder_date: task.reminder_date,
            status_id: task.status_id,
            assigner_id: task.assigner?.id || ""
        });
    };

    const handleSave = async () => {
        try {
            const formattedDueDate = editedTask.due_date ? editedTask.due_date : null;
            const formattedReminderDate = editedTask.reminder_date ? editedTask.reminder_date : null;
            const formatAssigner = editedTask.assigner_id ? editedTask.assigner_id : null;

            if (formattedReminderDate && formattedDueDate && new Date(formattedReminderDate) > new Date(formattedDueDate)) {
                DangerToast("Reminder date cannot be after due date!");
                return;
            }

            const response = await FetchPostAPI('/task/update', {
                id: task.id,
                name: editedTask.name,
                description: editedTask.description,
                due_date: formattedDueDate,
                reminder_date: formattedReminderDate,
                status_id: editedTask.status_id,
                assigner_id: formatAssigner,
                is_complete: task.is_complete
            });

            if (response.success) {
                setIsEditing(false);
                fetchTaskDetail();
            } else {
                DangerToast("Failed to update task!", response.message);
            }
        } catch (error) {
            DangerToast("Failed to update task!", error.message);
        }
    };

    const handleCheckboxChange = async (e) => {
        const isChecked = e.target.checked;

        try {
            const response = await FetchPostAPI('/task/update', {
                id: task.id,
                name: task.name,
                description: task.description,
                due_date: task.due_date,
                reminder_date: task.reminder_date,
                assigner: editedTask.assigner,
                is_complete: isChecked
            });

            if (response.success) {
                setTask({ ...task, is_complete: isChecked });
            } else {
                DangerToast("Failed to update task!", response.message);
            }
        } catch (error) {
            DangerToast("Failed to update task!", error.message);
        }
    };

    //Change Status
    const handleStatusChange = async (e) => {
        const newStatusId = e.target.value;
        const status = statuses.find(status => status.id == newStatusId);
        const newPosition = status ? status.task_count : 0;
        console.log(status);
        try {
            const response = await FetchPostAPI('/task/move', {
                id: task.id,
                status_id: newStatusId,
                position: newPosition
            });

            if (response.success) {
                setTask({ ...task, status_id: newStatusId });
                const updatedStatuses = statuses.map(s => 
                    s.id === newStatusId ? { ...s, task_count: s.task_count + 1 } : s
                );
                setStatuses(updatedStatuses);
            } else {
                DangerToast("Failed to update status!", response.message);
            }
        } catch (error) {
            DangerToast("Failed to update status!", error.message);
        }
    };

    const handleAssignerChange = (e) => {
        const assignerId = e.target.value;
        console.log(assignerId);
        setEditedTask({ ...editedTask, assigner_id: assignerId });
    };

    const isAssigner = () => {
        return editedTask.assigner_id === userId;
    };

    //Set date
    const getDateString = (s) => {
        if(s===null) return "--/--/----";
        return format(new Date(s), 'dd/MM/yyyy HH:mm:ss');
    }

    //Loading
    if (isLoading) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    //Fetch fail
    if (!task || !task.name) {
        return <div className="text-center mt-5">No task found.</div>;
    }

    return (
        <div className="bg-dark text-light py-4">
            <Container>
                <Card className="border-0 shadow" style={{ borderRadius: '20px' }}>
                    <Card.Body className="bg-secondary text-white">
                        <>
                            <h1 className="card-title text-center mb-4" style={{ backgroundColor: '#343a40', padding: '10px', borderRadius: '8px' }}>{task.name}</h1>
                            {!isEditing && (
                                <Form.Group className="mb-3">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Control as="select" value={task.status_id} onChange={handleStatusChange} disabled={!isAssigner()}>
                                        {statuses.map(status => (
                                            <option key={status.id} value={status.id}>{status.name}</option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            )}
                            {isEditing ? (
                                <>
                                    <Form>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Name</Form.Label>
                                            <Form.Control type="text" name="name" value={editedTask.name} onChange={(e) => setEditedTask({ ...editedTask, name: e.target.value })} />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Description</Form.Label>
                                            <Form.Control as="textarea" rows={3} name="description" value={editedTask.description} onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })} />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Due Date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="due_date"
                                                value={editedTask.due_date ? new Date(editedTask.due_date).toISOString().substr(0, 10) : ''}
                                                onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value })}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Reminder Date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="reminder_date"
                                                value={editedTask.reminder_date ? new Date(editedTask.reminder_date).toISOString().substr(0, 10) : ''}
                                                onChange={(e) => setEditedTask({ ...editedTask, reminder_date: e.target.value })}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Assigner</Form.Label>
                                            <Form.Control as="select" value={editedTask.assigner_id} onChange={handleAssignerChange}>
                                                <option value="">No select...</option>
                                                {members
                                                    .filter(assigner => leader === null || assigner.id !== leader.id) 
                                                    .map(assigner => (
                                                        <option key={assigner.id} value={assigner.id}>{`${assigner.firstname} ${assigner.lastname}`}</option>                                              
                                                    ))
                                                }
                                            </Form.Control>
                                        </Form.Group>
                                        <div className="d-flex justify-content-end">
                                            <Button variant="primary" className="me-2" onClick={handleSave}>Save</Button>
                                            <Button variant="secondary" onClick={handleCancelEdit}>Cancel</Button>
                                        </div>
                                    </Form>
                                </>
                            ) : (
                                <>
                                    <div className="task-details-bg p-3" style={{ backgroundColor: '#5a5a5a', borderRadius: '8px', marginBottom: '20px' }}>
                                        <p className="card-text"><strong>Description:</strong> {task.description}</p>
                                        <p className="card-text"><strong>Due Date:</strong> {getDateString(task.due_date)}</p>
                                        <p className="card-text"><strong>Reminder Date:</strong> {getDateString(task.reminder_date)}</p>
                                        {task.assigner && (
                                            <div className="mt-4">
                                                <h3>Assigned by:</h3>
                                                <p className="card-text"><strong>Name:</strong> {`${task.assigner.firstname} ${task.assigner.lastname}`}</p>
                                                <p className="card-text"><strong>Username:</strong> {task.assigner.username}</p>
                                                {task.assigner.avatar && (
                                                    <img
                                                        src={task.assigner.avatar}
                                                        alt="Avatar"
                                                        className="rounded-circle mt-2"
                                                        style={{ width: '50px', height: '50px' }}
                                                    />
                                                )}
                                            </div>
                                        )}
                                        <Form.Check
                                            className="mt-4"
                                            type="checkbox"
                                            id="completed-checkbox"
                                            label="Completed"
                                            checked={task.is_complete}
                                            disabled={!isAssigner()}
                                            onChange={handleCheckboxChange}
                                        />
                                    </div>
                                    {leader && leader.id === userId && (
                                        <div className="d-flex justify-content-end">
                                             <Button variant="primary" onClick={handleEdit}>Edit</Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
}

export default TaskDetail;
