import { Check, Pen, Trash, X, CalendarWeek, PersonSquare } from "react-bootstrap-icons";
import { Button, ButtonGroup, Modal } from "react-bootstrap";
import Jdenticon from 'react-jdenticon';
import { format } from 'date-fns';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useOutletContext, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { FetchPostAPI } from "../../config/config";
import { DangerToast } from "../../component/toast";

function Task({ view, data, fake_id, globalUID, setGlobalUID, fetchContent, taskDeleteHandler }) {
    const user = useOutletContext();
    const navigate = useNavigate(); 
    const uid = `task-id-${data.id}`;
    const [name, setName] = useState('');
    const [isShowing, setIsShowing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: uid, data: { ...data, type: 'TASK' } });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : undefined
    };

    const getDateString = (s) => {
        return format(new Date(s), 'dd/MM/yyyy HH:mm:ss');
    }

    const date_diff = (reminder_date, due_date) => {
        if(due_date == null) return '';

        let startDate = reminder_date != null ? new Date(reminder_date) : new Date();
        let endDate = new Date(due_date);

        if (startDate > endDate) return 'OVER DUE';

        let timeDifference = endDate - startDate;

        let seconds = timeDifference / 1000;
        let minutes = seconds / 60;
        let hours = minutes / 60;
        let days = hours / 24;
        let months = days / 30.436875;
        let years = months / 12;
    
        if (years >= 1) {
            return `${Math.floor(years)} years remains`;
        } else if (months >= 1) {
            return `${Math.floor(months)} months remains`;
        } else if (days >= 1) {
            return `${Math.floor(days)} days remains`;
        } else if (hours >= 1) {
            return `${Math.floor(hours)} hours remains`;
        } else if (minutes >= 1) {
            return `${Math.floor(minutes)} minutes remains`;
        } else {
            return `Less than 1 minute`;
        }
    }

    const colorHandler = (reminder_date, due_date, is_complete = false) => {
        if(!reminder_date && !due_date) return 'secondary';
        if(is_complete) return 'success';

        let currentDate = new Date();
        let minDate = new Date(-8640000000000000);
        let maxDate = new Date(8640000000000000);
        let startDate = reminder_date != null ? new Date(reminder_date) : minDate;
        let endDate = due_date != null ? new Date(due_date) : maxDate;

        if (currentDate < startDate) return 'secondary';
        else if (currentDate < endDate) {
            let daysDifference = (endDate - currentDate) / (1000 * 60 * 60 * 24);
            return Math.floor(daysDifference) > 1 ? 'primary' : 'warning';
        } else return 'danger';
    }

    const taskUpdateHandler = async (name) => {
        data.name = name;
        setIsEditing(false);
        setGlobalUID(null);
        try {
            var res = await FetchPostAPI(`/task/update`, {
                id: data.id,
                name: name
            });
            if (!res.success) throw Error(res.message);
        } catch (error) {
            DangerToast("Update Task Failed!", error.message);
        } finally {
            fetchContent();
        }
    }

    // This will set state back to normal when globalUID change
    useEffect(() => {
        if (globalUID == null || globalUID.toString() !== uid.toString()) {
            setIsEditing(false);
        }
    }, [uid, globalUID]);

    const color = colorHandler(data.reminder_date, data.due_date, data.is_complete);

    return <li className="d-flex shadow-lg"
        ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {/* Detect this is placeholder or not */}
        {fake_id != null && data.id === fake_id
            ? <></>
            : <div className={`flex-grow-1 p-2 rounded bg-${color}`}
                onClick={() => navigate(`/task/${data.id}`, { state: { viewId: view.id, userId: user.id } })} >
                <div className="m-0"
                    style={{
                        display: 'grid',
                        gridGap: '0.5rem',
                        listStyle: 'none'
                    }}
                >
                    {!isEditing
                    ? <div className="d-flex justify-content-between align-items-center">
                        <p className="m-0 flex-fill">{data.name}</p>
                        {view.leader?.id === user.id
                            ? <ButtonGroup size="sm">
                                <Button 
                                    variant={color} 
                                    className="text-light" 
                                    type="button" 
                                    onClick={() => {
                                    setName(data.name);
                                    setIsEditing(true);
                                    setGlobalUID(uid);
                                }}>
                                    <Pen size={20} />
                                </Button>
                                <Button 
                                    variant={color} 
                                    className="text-light"
                                    onClick={() => setIsShowing(true)}>
                                    <Trash size={20} />
                                </Button>
                            </ButtonGroup>
                            : <></>}
                    </div>
                    : <form id={`edit-task-${data.id}`}
                        className="d-flex justify-content-between align-items-center"
                        onSubmit={(e) => {
                            e.preventDefault();
                            taskUpdateHandler(name);
                        }}
                    >
                        <input
                            autoFocus
                            required
                            className="m-0 flex-fill"
                            data-bs-theme="dark"
                            value={name}
                            onChange={(e) => setName(e.target.value)} 
                        />
                        <ButtonGroup size="sm">
                            <Button 
                                variant={color} 
                                className="text-light"
                                type="submit" 
                                form={`edit-task-${data.id}`}
                            >
                                <Check size={20} />
                            </Button>
                            <Button 
                                variant={color} 
                                className="text-light"
                                onClick={() => {
                                setGlobalUID(null);
                            }}>
                                <X size={20} />
                            </Button>
                        </ButtonGroup>
                    </form>}
                    <div className="d-flex align-items-center">
                        <CalendarWeek size={20} />
                        <div className="ps-2 d-flex flex-fill justify-content-between align-items-center">
                            <div>
                                {data.due_date != null ? getDateString(data.due_date) : '-'}
                            </div>
                            <div>
                                {data.is_complete ? 'COMPLETE' : date_diff(data.reminder_date, data.due_date)}
                            </div>
                        </div>
                    </div>
                    <div className="d-flex align-items-center">
                        <PersonSquare size={20} />
                        <div className="ps-2 d-flex align-items-center">
                            {data.assigner != null
                                ? <Jdenticon size={'25'} value={data.assigner.id.toString()} />
                                : '-'}
                        </div>
                    </div>
                </div>
            </div>}

        <DeleteDialog
            show={isShowing}
            onHide={() => setIsShowing(false)}
            onSubmit={() => {
                setIsShowing(false);
                taskDeleteHandler(data.id);
            }} />
    </li>
}

function DeleteDialog({ show, onHide, onSubmit }) {
    return <Modal data-bs-theme="dark" className="text-light"
        show={show} onHide={onHide}>
        <Modal.Header>
            <Modal.Title className="text-danger">Delete Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you wanna delete this task?</Modal.Body>
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

export default Task;