import { Check, Pen, Trash, X } from "react-bootstrap-icons";
import { Button, ButtonGroup, Modal } from "react-bootstrap";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";

import { FetchPostAPI } from "../../config/config";
import { DangerToast } from "../../component/toast";

function Task({ view, data, fake_id, globalUID, setGlobalUID, fetchContent, taskDeleteHandler }) {
    const user = useOutletContext();
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

    return <li className="d-flex shadow-lg"
        ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {/* Detect this is placeholder or not */}
        {fake_id != null && data.id === fake_id
            ? <></>
            : <div className="flex-grow-1 p-2 bg-secondary rounded">
                {!isEditing
                    ? <div className="d-flex justify-content-between align-items-center">
                        <p className="m-0 flex-fill">{data.name}</p>
                        {view.leader?.id === user.id
                            ? <ButtonGroup size="sm">
                                <Button variant="secondary" type="button" onClick={() => {
                                    setName(data.name);
                                    setIsEditing(true);
                                    setGlobalUID(uid);
                                }}>
                                    <Pen size={20} />
                                </Button>
                                <Button variant="secondary" onClick={() => setIsShowing(true)}>
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
                            <Button variant="secondary" type="submit" form={`edit-task-${data.id}`}>
                                <Check size={20} />
                            </Button>
                            <Button variant="secondary" onClick={() => {
                                setGlobalUID(null);
                            }}>
                                <X size={20} />
                            </Button>
                        </ButtonGroup>
                    </form>}
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