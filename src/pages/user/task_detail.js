import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import  Server_URL, { FetchGetAPI, FetchPostAPI } from "../../config/config";
import { DangerToast } from "../../component/toast";
import { Container, Card, Button, Form, Row, Col, Popover, OverlayTrigger } from "react-bootstrap";
import { format } from 'date-fns';
import { Chat, SortDown } from "react-bootstrap-icons";
import ChatMess from "./chat"; 

function TaskDetail() {
    const { id } = useParams();
    const location = useLocation();
    const viewId = location.state?.viewId;
    const userId = JSON.parse(sessionStorage.getItem("user_id"));
    const [task, setTask] = useState({});
    const [viewInfo, setViewInfo] = useState({});
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
    const [isChatOpen, setIsChatOpen] = useState(false);

    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const [isChatVisible, setIsChatVisible] = useState(false);

    useEffect(() => {
        fetchTaskDetail();
        fetchViewInfo();
        fetchLeader();
        fetchFiles();
        fetchMembers();
        fetchViewInfo();
        if (viewId) {
            fetchStatuses(viewId).then(setStatuses);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, viewId]);

    useEffect(() => {
        if (members.length > 0 && userId) {
            setIsChatVisible(members.some(member => member.id === userId));
        }
    }, [members, userId]);

    const toggleChatPopup = () => {
        setIsChatOpen(!isChatOpen);
    };

    const fetchViewInfo = async () => {
        try {
            const response = await FetchGetAPI(`/task/${id}/view`);
            setViewInfo(response);
        } catch (error) {
            DangerToast("Failed to fetch view info!", error.message);
        }
    }

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
            let data = await FetchGetAPI(`/task?id=${id}`);
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

     const fetchFiles = async () => {
        try {
            const response = await FetchGetAPI(`/task/${id}/file`);
            setUploadedFiles(response); 
            console.log(response);
        } catch (error) {
            DangerToast("Failed to fetch files!", error.message);
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
                complete_date: task.complete_date
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
        let completeDate = isChecked ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null;
        if (isChecked && (leader.id !== userId && !isAssigner())) {
            DangerToast("Only the assigner can mark the task as completed.");
            return;
        }
        if (!isChecked && task.completed_date && leader.id !== userId) {
            DangerToast("Only the leader can uncheck after the task is completed.");
            return;
        }

        if (!isChecked && !task.completed_date && leader.id === userId) {
            DangerToast("Cannot uncheck because the task is not yet marked completed by the assigner!");
            return;
        }

        try {
            const response = await FetchPostAPI('/task/update', {
                id: task.id,
                name: task.name,
                description: task.description,
                due_date: task.due_date,
                reminder_date: task.reminder_date,
                assigner: task.assigner,
                completed_date: completeDate
            });

            if (response.success) {
                setTask({ ...task, completed_date: completeDate });
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
        const status = statuses.find(status => status.id.toString() === newStatusId.toString());
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

    const handleFileChange = (event) => {
        setSelectedFiles(event.target.files);
    };
    
    const handleFileUpload = async () => {
        const formData = new FormData();
        for (let i = 0; i < selectedFiles.length; i++) {
            formData.append('files', selectedFiles[i]);
        } 
        try {
            const response = await fetch(`${Server_URL}/task/${id}/upload`, {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (result.message) {
                setSelectedFiles([]);
                fetchFiles();

                const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
                const updateResponse = await FetchPostAPI('/task/update', {
                    id: task.id,
                    name: task.name,
                    description: task.description,
                    due_date: task.due_date,
                    reminder_date: task.reminder_date,
                    assigner: task.assigner,
                    completed_date: currentDate
                });
    
                if (updateResponse.success) {
                    setTask({ ...task, completed_date: currentDate });
                } else {
                    DangerToast("Failed to update task status!", updateResponse.message);
                }
            } else {
                DangerToast("Upload failed!");
            }
        } catch (error) {
            DangerToast("Failed to upload files!", error.message);
        }
    };
    
    const handleCancelCompletion = async () => {
        for (const fileName of uploadedFiles) {
            try {
                const response = await fetch(`${Server_URL}/task/${id}/file/delete/${fileName}`, {
                    method: 'GET',
                });
    
                const result = await response.json();
                if (!result.success) {
                    DangerToast("Failed to delete file!", result.message);
                    return;
                }
            } catch (error) {
                DangerToast("Failed to delete file!", error.message);
                return;
            }
        }
        try {
            const response = await FetchPostAPI('/task/update', {
                id: task.id,
                name: task.name,
                description: task.description,
                due_date: task.due_date,
                reminder_date: task.reminder_date,
                assigner: task.assigner,
                completed_date: null 
            });
    
            if (response.success) {
                setTask({ ...task, completed_date: null });
                fetchFiles(); 
            } else {
                DangerToast("Failed to update task!", response.message);
            }
        } catch (error) {
            DangerToast("Failed to update task!", error.message);
        }
    };
    
    const handleDownload = (fileName) => {
        const downloadUrl = `${Server_URL}/task/${id}/file/download/${fileName}`;
        window.open(downloadUrl, '_blank');
    };

    const chatPopover = (
        <Popover data-bs-theme="dark" style={{'--bs-popover-max-width': '480px'}} className='w-100'>
            <Popover.Header className='text-light'>
                <div className='text-center h5 mb-0'>Chat</div>
            </Popover.Header>
            <Popover.Body>
                <ChatMess 
                    viewId={viewId} 
                    userId={userId}
                 />
            </Popover.Body>
        </Popover>
    );

    return (
        <div className="bg-dark text-light py-4">
            <Container>
                <Row>
                    <Col md={8}>
                        <Card className="border-0 shadow" style={{ borderRadius: '20px' }}>
                            <Card.Body className="bg-secondary text-white">
                                <>
                                    <h1 className="card-title text-center mb-4" style={{ backgroundColor: '#343a40', padding: '10px', borderRadius: '8px' }}>{task.name}</h1>
                                    {!isEditing && (
                                        <Form.Group className="mb-3">
                                            <Form.Label>Status</Form.Label>
                                            <Form.Control as="select" value={task.status_id} onChange={handleStatusChange}  disabled={!leader || leader.id !== userId}>
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
                                                        {members.map(assigner => (
                                                            <option key={assigner.id} value={assigner.id}>{`${assigner.firstname} ${assigner.lastname}`}</option>
                                                        ))}
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
                                                    </div>
                                                )}
                                                <Form.Check
                                                    className="mt-4"
                                                    type="checkbox"
                                                    id="completed-checkbox"
                                                    label="Completed"
                                                    checked={!!task.completed_date}
                                                    disabled={
                                                        (!isAssigner() && !task.completed_date) ||   
                                                        (isAssigner() && !!task.completed_date && (!leader || leader.id !== userId)) || 
                                                        (!isAssigner() && !leader && !task.completed_date) ||  
                                                        (!isAssigner() && leader && leader.id !== userId) ||  
                                                        (!isAssigner() && !leader && !!task.completed_date)  
                                                    }
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
                    </Col>
                    <Col md={4}>
                        <Card className="border-0 shadow" style={{ borderRadius: '20px' }}>
                            <Card.Body className="bg-secondary text-white">
                                <h3>Upload File</h3>
                                <Form>
                                    {uploadedFiles.length === 0 ? (
                                        <Form.Group controlId="formFile" className="mb-3">
                                            <Form.Label>Select file to upload</Form.Label>
                                            <Form.Control 
                                                type="file"
                                                multiple 
                                                onChange={handleFileChange} 
                                            />
                                        </Form.Group>
                                    ) : (
                                        <div style={{ 
                                            backgroundColor: 'white', 
                                            padding: '10px', 
                                            borderRadius: '5px', 
                                            marginTop: '10px',
                                            color: 'black'
                                        }}>
                                            <ul className="list-unstyled" style={{ paddingLeft: '0' }}>
                                                {uploadedFiles.map((fileName, index) => (
                                                    <li 
                                                        key={index} 
                                                        style={{ 
                                                            marginBottom: '10px', 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            justifyContent: 'space-between',
                                                            padding: '5px 0'
                                                        }}
                                                    >
                                                        <span>{fileName}</span>
                                                        <SortDown 
                                                            style={{ marginLeft: '10px', cursor: 'pointer' }} 
                                                            onClick={() => handleDownload(fileName)}
                                                        />
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {task.assigner && (userId === task.assigner.id || (userId === viewInfo.leader_id && task.completed_date !== null)) && (
                                        <Button 
                                            variant={uploadedFiles.length > 0 ? "danger" : "primary"} 
                                            onClick={uploadedFiles.length > 0 ? handleCancelCompletion : handleFileUpload} 
                                            disabled={selectedFiles.length === 0 && uploadedFiles.length === 0}
                                            style={{ width: '100%' }}
                                        >
                                            {uploadedFiles.length > 0 ? "Cancel Completion" : "Submit"}
                                            
                                        </Button>
                                    )}
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
            {isChatVisible===true &&(
                <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
                <OverlayTrigger trigger="click" placement="top" overlay={chatPopover}>
                    <Button variant="primary" onClick={toggleChatPopup}>
                        <Chat size={30} />
                    </Button>
                </OverlayTrigger>
            </div>)}
        </div>
    );
}

export default TaskDetail;
